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
      shippingCost: 0,
      lossRate: 0,
      requiredWidth: 0,
      requiredLength: 0,
      yieldRate: 1,
      extraRate: 0,
    };
  });

  const processingInput = {
    ...payload.processing,
    requiredQuantity: 1,
    partsPerRun: 1,
    setupMinutes: 0,
    inspectionMinutes: 0,
    packingMinutes: 0,
  };
  const processingCalc = calcProcessing(processingInput);
  const prototypeCost = calcPrototype(payload.prototype);
  const includedPrototypeCost = prototypeCost;
  const materialCost = materials.reduce((sum, row) => sum + row.totalCost, 0);
  const summary = calcSummary({
    materialCost,
    processingCost: processingCalc.processingCost,
    setupCost: processingCalc.setupCost,
    finishingCost: processingCalc.finishingCost,
    inspectionCost: processingCalc.inspectionCost,
    packingCost: processingCalc.packingCost,
    prototypeCost: includedPrototypeCost,
    outsourcingCost: payload.outsourcingCost,
    consumableCost: 0,
    riskCost: 0,
    profitRate: payload.profitRate,
  });

  const lots = payload.lots.map((row, index) => {
    const lotProcessing = calcProcessing({ ...processingInput, requiredQuantity: row.quantity });
    const cost =
      materialCost +
      lotProcessing.processingCost +
      lotProcessing.setupCost +
      lotProcessing.finishingCost +
      payload.outsourcingCost;
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
      prototypeCost: includedPrototypeCost,
      outsourcingCost: payload.outsourcingCost,
      consumableCost: 0,
      riskCost: 0,
      profit: summary.profit,
      quoteAmount: summary.quoteAmount,
      grossMarginRate: summary.grossMarginRate,
    },
    materials,
    processing: {
      ...processingInput,
      ...processingCalc,
      partsPerRun: 1,
      inspectionMinutes: 0,
      inspectionCost: 0,
      packingMinutes: 0,
      packingCost: 0,
    },
    prototype: {
      ...payload.prototype,
      designCost: 0,
      conditionTestCost: 0,
      prototypeRiskCost: 0,
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
