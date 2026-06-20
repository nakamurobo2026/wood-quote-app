import { NextResponse } from "next/server";
import { normalizeEstimatePayload, type EstimatePayload } from "@/lib/estimate-payload";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const estimates = await prisma.estimate.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(estimates);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as EstimatePayload;
  const data = normalizeEstimatePayload(payload);

  const estimate = await prisma.estimate.create({
    data: {
      ...data.estimate,
      materials: { create: data.materials },
      processing: { create: data.processing },
      prototype: { create: data.prototype },
      actual: { create: data.actual },
      lotRows: { create: data.lots },
    },
    include: { materials: true, processing: true, prototype: true, actual: true, lotRows: true },
  });

  return NextResponse.json(estimate, { status: 201 });
}
