import { PrismaClient } from "@prisma/client";
import { calcSettingRates } from "../lib/calculations";

const prisma = new PrismaClient();

async function main() {
  const base = {
    rent: 80000,
    electricity: 30000,
    communication: 10000,
    software: 20000,
    vehicle: 20000,
    insurance: 15000,
    consumables: 30000,
    loanRepayment: 50000,
    taxReserve: 50000,
    livingCost: 250000,
    desiredProfit: 200000,
    workingDays: 20,
    hoursPerDay: 8,
    utilizationRate: 0.7,
    bufferRate: 0.1,
  };
  const {
    requiredMonthlyRevenue: _requiredMonthlyRevenue,
    availableHours: _availableHours,
    ...rates
  } = calcSettingRates(base);
  await prisma.setting.upsert({
    where: { id: "default" },
    update: { ...base, ...rates },
    create: { id: "default", ...base, ...rates },
  });

  const materialCount = await prisma.material.count();
  if (materialCount === 0) {
    await prisma.material.createMany({
      data: [
        {
          materialName: "シナ合板",
          category: "合板",
          thickness: 12,
          width: 910,
          length: 1820,
          supplier: "標準",
          unitPrice: 4200,
          shippingCost: 0,
          lossRate: 0,
        },
        {
          materialName: "MDF",
          category: "板材",
          thickness: 9,
          width: 910,
          length: 1820,
          supplier: "標準",
          unitPrice: 2500,
          shippingCost: 0,
          lossRate: 0,
        },
      ],
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
