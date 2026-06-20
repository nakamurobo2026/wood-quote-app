import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcSettingRates } from "@/lib/calculations";

export async function GET() {
  const setting = await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  return NextResponse.json(setting);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { requiredMonthlyRevenue: _requiredMonthlyRevenue, availableHours: _availableHours, ...rates } =
    calcSettingRates(body);
  const setting = await prisma.setting.upsert({
    where: { id: "default" },
    update: { ...body, ...rates },
    create: { id: "default", ...body, ...rates },
  });
  return NextResponse.json(setting);
}
