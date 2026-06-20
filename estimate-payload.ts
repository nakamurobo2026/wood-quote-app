import { QuoteType } from "@prisma/client";
import {
  calcMaterial,
  calcProcessing,
  calcPrototype,
  calcSummary,
  type MaterialInput,
  type ProcessingInput,
  type PrototypeInput,
} from "@/lib/calculations";

export type EstimatePayload = {
  name: string;
  customerName?: string | null;
  drawingFileName?: string | null;
  memo?: string | null;
  quoteType: QuoteType;
  issuedAt?: string | null;
  expiresAt?: string | null;
  quoteNote?: string | null;
  outsourcingCost: number;
  consumableCost: number;
  riskCost: number;
  profitRate: number;
  materials: MaterialInput[];
  processing: ProcessingInput;
  prototype: PrototypeInput;
  actual: {
    actualWorkMinutes: number;
    actualMaterialCost: number;
    memo?: string | null;
  };
  lots: { quantity: number }[];
};

export function normalizeEstimatePayload(payload: EstimatePayload) {
  const materials = payload.materials.map((row, index) => {
    const calculated = calcMaterial(row);
    return {
      ...row,
      ...calculated,
      sortOrder: index,
      materialId: null,
      category: row.category || null,
      supplier: row.supplier || null,
      thickness: row.thickness || null,
    };
  });

  const processingCalc = calcProcessing(payload.processing);
  const prototypeCost = calcPrototype(payload.prototype);
  const materialCost = materials.reduce((sum, row) => sum + row.totalCost, 0);
  const summary = calcSummary({
    materialCost,
    processingCost: processingCalc.processingCost,
    setupCost: processingCalc.setupCost,
    finishingCost: processingCalc.finishingCost,
    inspectionCost: processingCalc.inspectionCost,
    packingCost: processingCalc.packingCost,
    prototypeCost,
    outsourcingCost: payload.outsourcingCost,
    consumableCost: payload.consumableCost,
    riskCost: payload.riskCost + payload.prototype.prototypeRiskCost,
    profitRate: payload.profitRate,
  });

  const unitCostBase =
    materialCost +
    processingCalc.processingCost +
    processingCalc.setupCost +
    processingCalc.finishingCost +
    processingCalc.inspectionCost +
    processingCalc.packingCost +
    payload.outsourcingCost +
    payload.consumableCost;
  const initialCost = prototypeCost + payload.riskCost;

  const lots = payload.lots.map((row, index) => {
    const cost = unitCostBase * row.quantity + initialCost;
    const profit = Math.round(cost * payload.profitRate);
    const totalPrice = cost + profit;
    return {
      quantity: row.quantity,
      cost,
      profit,
      totalPrice,
      unitPrice: row.quantity > 0 ? Math.round(totalPrice / row.quantity) : 0,
      profitRate: totalPrice > 0 ? (profit / totalPrice) * 100 : 0,
      sortOrder: index,
    };
  });

  return {
    estimate: {
      name: payload.name || "無題の見積",
      customerName: payload.customerName || null,
      drawingFileName: payload.drawingFileName || null,
      memo: payload.memo || null,
      quoteType: payload.quoteType,
      issuedAt: payload.issuedAt ? new Date(payload.issuedAt) : null,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
      quoteNote: payload.quoteNote || null,
      materialCost,
      processingCost: processingCalc.processingCost,
      setupCost: processingCalc.setupCost,
      finishingCost: processingCalc.finishingCost,
      inspectionCost: processingCalc.inspectionCost,
      packingCost: processingCalc.packingCost,
      prototypeCost,
      outsourcingCost: payload.outsourcingCost,
      consumableCost: payload.consumableCost,
      riskCost: payload.riskCost + payload.prototype.prototypeRiskCost,
      profit: summary.profit,
      quoteAmount: summary.quoteAmount,
      grossMarginRate: summary.grossMarginRate,
    },
    materials,
    processing: {
      ...payload.processing,
      ...processingCalc,
    },
    prototype: {
      ...payload.prototype,
      totalCost: prototypeCost,
    },
    actual: {
      actualWorkMinutes: payload.actual?.actualWorkMinutes ?? 0,
      actualMaterialCost: payload.actual?.actualMaterialCost ?? 0,
      memo: payload.actual?.memo || null,
    },
    lots,
  };
}
