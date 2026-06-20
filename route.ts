import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const original = await prisma.estimate.findUnique({
    where: { id },
    include: {
      materials: { orderBy: { sortOrder: "asc" } },
      processing: true,
      prototype: true,
      actual: true,
      lotRows: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!original) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const processing = original.processing
    ? {
        requiredQuantity: original.processing.requiredQuantity,
        partsPerRun: original.processing.partsPerRun,
        minutesPerRun: original.processing.minutesPerRun,
        setupMinutes: original.processing.setupMinutes,
        toolChangeMinutes: original.processing.toolChangeMinutes,
        finishingMinutes: original.processing.finishingMinutes,
        inspectionMinutes: original.processing.inspectionMinutes,
        packingMinutes: original.processing.packingMinutes,
        runCount: original.processing.runCount,
        machineMinutes: original.processing.machineMinutes,
        totalWorkMinutes: original.processing.totalWorkMinutes,
        machineRate: original.processing.machineRate,
        setupRate: original.processing.setupRate,
        handworkRate: original.processing.handworkRate,
        finishingRate: original.processing.finishingRate,
        processingCost: original.processing.processingCost,
        setupCost: original.processing.setupCost,
        finishingCost: original.processing.finishingCost,
        inspectionCost: original.processing.inspectionCost,
        packingCost: original.processing.packingCost,
      }
    : null;
  const prototype = original.prototype
    ? {
        dataCheckCost: original.prototype.dataCheckCost,
        designCost: original.prototype.designCost,
        conditionTestCost: original.prototype.conditionTestCost,
        jigReviewCost: original.prototype.jigReviewCost,
        revisionCost: original.prototype.revisionCost,
        prototypeRiskCost: original.prototype.prototypeRiskCost,
        totalCost: original.prototype.totalCost,
      }
    : null;
  const actual = original.actual
    ? {
        actualWorkMinutes: original.actual.actualWorkMinutes,
        actualMaterialCost: original.actual.actualMaterialCost,
        memo: original.actual.memo,
      }
    : null;

  const copy = await prisma.estimate.create({
    data: {
      name: `${original.name} のコピー`,
      customerName: original.customerName,
      drawingFileName: original.drawingFileName,
      memo: original.memo,
      quoteType: original.quoteType,
      materialCost: original.materialCost,
      processingCost: original.processingCost,
      setupCost: original.setupCost,
      finishingCost: original.finishingCost,
      inspectionCost: original.inspectionCost,
      packingCost: original.packingCost,
      prototypeCost: original.prototypeCost,
      outsourcingCost: original.outsourcingCost,
      consumableCost: original.consumableCost,
      riskCost: original.riskCost,
      profit: original.profit,
      quoteAmount: original.quoteAmount,
      grossMarginRate: original.grossMarginRate,
      issuedAt: original.issuedAt,
      expiresAt: original.expiresAt,
      quoteNote: original.quoteNote,
      materials: {
        create: original.materials.map(({ id: _id, estimateId: _estimateId, ...row }) => row),
      },
      processing: processing ? { create: processing } : undefined,
      prototype: prototype ? { create: prototype } : undefined,
      actual: actual ? { create: actual } : undefined,
      lotRows: {
        create: original.lotRows.map(({ id: _id, estimateId: _estimateId, ...row }) => row),
      },
    },
  });

  return NextResponse.json(copy, { status: 201 });
}
