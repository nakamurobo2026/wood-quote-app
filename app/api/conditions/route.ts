import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const conditions = await prisma.machiningCondition.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(conditions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const condition = await prisma.machiningCondition.create({ data: body });
  return NextResponse.json(condition, { status: 201 });
}
