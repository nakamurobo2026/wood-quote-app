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
        requiredQuantity: 1,
        partsPerRun: 1,
        minutesPerRun: original.processing.minutesPerRun,
        setupMinutes: 0,
        toolChangeMinutes: original.processing.toolChangeMinutes,
        finishingMinutes: original.processing.finishingMinutes,
        inspectionMinutes: 0,
        packingMinutes: 0,
        runCount: original.processing.runCount,
        machineMinutes: original.processing.machineMinutes,
        totalWorkMinutes: Math.max(0, original.processing.machineMinutes + original.processing.toolChangeMinutes + original.processing.finishingMinutes),
        machineRate: original.processing.machineRate,
        setupRate: original.processing.setupRate,
        handworkRate: original.processing.handworkRate,
        finishingRate: original.processing.finishingRate,
        processingCost: original.processing.processingCost,
        setupCost: original.processing.toolChangeMinutes > 0
          ? Math.round((original.processing.toolChangeMinutes / 60) * original.processing.setupRate)
          : 0,
        finishingCost: original.processing.finishingCost,
        inspectionCost: 0,
        packingCost: 0,
      }
    : null;
  const prototype = original.prototype
    ? {
        dataCheckCost: original.prototype.dataCheckCost,
        designCost: 0,
        conditionTestCost: 0,
        jigReviewCost: original.prototype.jigReviewCost,
        revisionCost: original.prototype.revisionCost,
        prototypeRiskCost: 0,
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
      setupCost: original.processing?.toolChangeMinutes
        ? Math.round((original.processing.toolChangeMinutes / 60) * original.processing.setupRate)
        : 0,
      finishingCost: original.finishingCost,
      inspectionCost: 0,
      packingCost: 0,
      prototypeCost: original.prototypeCost,
      outsourcingCost: original.outsourcingCost,
      consumableCost: 0,
      riskCost: 0,
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
