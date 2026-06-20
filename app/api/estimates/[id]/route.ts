import { NextResponse } from "next/server";
import { normalizeEstimatePayload, type EstimatePayload } from "@/lib/estimate-payload";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const estimate = await prisma.estimate.findUnique({
    where: { id },
    include: {
      materials: { orderBy: { sortOrder: "asc" } },
      processing: true,
      prototype: true,
      actual: true,
      lotRows: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!estimate) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(estimate);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = (await request.json()) as EstimatePayload;
  const data = normalizeEstimatePayload(payload);

  const estimate = await prisma.$transaction(async (tx) => {
    await tx.estimateMaterial.deleteMany({ where: { estimateId: id } });
    await tx.estimateLotRow.deleteMany({ where: { estimateId: id } });

    return tx.estimate.update({
      where: { id },
      data: {
        ...data.estimate,
        materials: { create: data.materials },
        processing: { upsert: { create: data.processing, update: data.processing } },
        prototype: { upsert: { create: data.prototype, update: data.prototype } },
        actual: { upsert: { create: data.actual, update: data.actual } },
        lotRows: { create: data.lots },
      },
      include: { materials: true, processing: true, prototype: true, actual: true, lotRows: true },
    });
  });

  return NextResponse.json(estimate);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.estimate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
