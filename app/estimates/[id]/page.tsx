import { notFound } from "next/navigation";
import { EstimateEditor } from "@/components/estimate/EstimateEditor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EstimateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [setting, estimate, materialMasters] = await Promise.all([
    prisma.setting.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    }),
    prisma.estimate.findUnique({
      where: { id },
      include: {
        materials: { orderBy: { sortOrder: "asc" } },
        processing: true,
        prototype: true,
        actual: true,
        lotRows: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.material.findMany({ orderBy: [{ materialName: "asc" }, { thickness: "asc" }] }),
  ]);

  if (!estimate) notFound();

  const initial = {
    id: estimate.id,
    name: estimate.name,
    customerName: estimate.customerName ?? "",
    drawingFileName: estimate.drawingFileName ?? "",
    memo: estimate.memo ?? "",
    quoteType: estimate.quoteType,
    issuedAt: estimate.issuedAt ? estimate.issuedAt.toISOString().slice(0, 10) : "",
    expiresAt: estimate.expiresAt ? estimate.expiresAt.toISOString().slice(0, 10) : "",
    quoteNote: estimate.quoteNote ?? "",
    outsourcingCost: estimate.outsourcingCost,
    consumableCost: 0,
    riskCost: 0,
    profitRate: estimate.quoteAmount > 0 ? estimate.profit / (estimate.quoteAmount - estimate.profit || 1) : 0.3,
    materials: estimate.materials.map((row) => ({
      materialName: row.materialName,
      category: row.category,
      thickness: row.thickness,
      sheetWidth: row.sheetWidth,
      sheetLength: row.sheetLength,
      supplier: row.supplier,
      unitPrice: row.unitPrice,
      shippingCost: 0,
      lossRate: 0,
      requiredWidth: 0,
      requiredLength: 0,
      quantity: row.quantity,
      yieldRate: 1,
      extraRate: 0,
    })),
    processing: estimate.processing
      ? {
          requiredQuantity: 1,
          partsPerRun: 1,
          minutesPerRun: estimate.processing.minutesPerRun,
          setupMinutes: 0,
          toolChangeMinutes: estimate.processing.toolChangeMinutes,
          finishingMinutes: estimate.processing.finishingMinutes,
          inspectionMinutes: 0,
          packingMinutes: 0,
          machineRate: estimate.processing.machineRate,
          setupRate: estimate.processing.setupRate,
          handworkRate: estimate.processing.handworkRate,
          finishingRate: estimate.processing.finishingRate,
        }
      : {
          requiredQuantity: 1,
          partsPerRun: 1,
          minutesPerRun: 0,
          setupMinutes: 0,
          toolChangeMinutes: 0,
          finishingMinutes: 0,
          inspectionMinutes: 0,
          packingMinutes: 0,
          machineRate: 0,
          setupRate: 0,
          handworkRate: 0,
          finishingRate: 0,
        },
    prototype: estimate.prototype
      ? {
          dataCheckCost: estimate.prototype.dataCheckCost,
          designCost: 0,
          conditionTestCost: 0,
          jigReviewCost: estimate.prototype.jigReviewCost,
          revisionCost: estimate.prototype.revisionCost,
          prototypeRiskCost: 0,
        }
      : {
          dataCheckCost: 0,
          designCost: 0,
          conditionTestCost: 0,
          jigReviewCost: 0,
          revisionCost: 0,
          prototypeRiskCost: 0,
        },
    actual: estimate.actual
      ? {
          actualWorkMinutes: estimate.actual.actualWorkMinutes,
          actualMaterialCost: estimate.actual.actualMaterialCost,
          memo: estimate.actual.memo ?? "",
        }
      : {
          actualWorkMinutes: 0,
          actualMaterialCost: 0,
          memo: "",
        },
    lots: estimate.lotRows.length
      ? estimate.lotRows.map((row) => ({ quantity: row.quantity }))
      : [{ quantity: 1 }, { quantity: 5 }, { quantity: 10 }, { quantity: 30 }, { quantity: 50 }, { quantity: 100 }],
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-500">見積詳細</p>
        <h1 className="text-3xl font-black">{estimate.name}</h1>
      </div>
      <EstimateEditor initial={initial} rates={setting} materials={materialMasters} />
    </div>
  );
}
