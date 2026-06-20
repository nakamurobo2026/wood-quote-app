export type MaterialInput = {
  materialName: string;
  category?: string | null;
  thickness?: number | null;
  sheetWidth: number;
  sheetLength: number;
  supplier?: string | null;
  unitPrice: number;
  shippingCost: number;
  lossRate: number;
  requiredWidth: number;
  requiredLength: number;
  quantity: number;
  yieldRate: number;
  extraRate: number;
};

export type ProcessingInput = {
  requiredQuantity: number;
  partsPerRun: number;
  minutesPerRun: number;
  setupMinutes: number;
  toolChangeMinutes: number;
  finishingMinutes: number;
  inspectionMinutes: number;
  packingMinutes: number;
  machineRate: number;
  setupRate: number;
  handworkRate: number;
  finishingRate: number;
};

export type PrototypeInput = {
  dataCheckCost: number;
  designCost: number;
  conditionTestCost: number;
  jigReviewCost: number;
  revisionCost: number;
  prototypeRiskCost: number;
};

export function calcMaterial(row: MaterialInput) {
  const requiredArea = 0;
  const sheetArea = row.sheetWidth * row.sheetLength;
  const requiredSheets = Math.max(0, Math.ceil(row.quantity));
  const materialCost = requiredSheets * row.unitPrice;
  const lossCost = 0;
  const totalCost = materialCost;

  return { requiredArea, sheetArea, requiredSheets, materialCost, lossCost, totalCost };
}

export function calcProcessing(input: ProcessingInput) {
  const runCount = Math.max(0, input.requiredQuantity);
  const machineMinutes = input.minutesPerRun * runCount;
  const totalWorkMinutes =
    input.toolChangeMinutes +
    machineMinutes +
    input.finishingMinutes;

  const processingCost = Math.round((machineMinutes / 60) * input.machineRate);
  const setupCost = Math.round(
    (input.toolChangeMinutes / 60) * input.setupRate,
  );
  const finishingCost = Math.round((input.finishingMinutes / 60) * input.finishingRate);
  const inspectionCost = 0;
  const packingCost = 0;

  return {
    runCount,
    machineMinutes,
    totalWorkMinutes,
    processingCost,
    setupCost,
    finishingCost,
    inspectionCost,
    packingCost,
  };
}

export function calcPrototype(input: PrototypeInput) {
  return (
    input.dataCheckCost +
    input.jigReviewCost +
    input.revisionCost
  );
}

export function calcSettingRates(input: {
  rent: number;
  electricity: number;
  communication: number;
  software: number;
  vehicle: number;
  insurance: number;
  consumables: number;
  loanRepayment: number;
  taxReserve: number;
  livingCost: number;
  desiredProfit: number;
  workingDays: number;
  hoursPerDay: number;
  utilizationRate: number;
  bufferRate: number;
}) {
  const requiredMonthlyRevenue =
    input.rent +
    input.electricity +
    input.communication +
    input.software +
    input.vehicle +
    input.insurance +
    input.consumables +
    input.loanRepayment +
    input.taxReserve +
    input.livingCost +
    input.desiredProfit;
  const availableHours =
    input.workingDays *
    input.hoursPerDay *
    input.utilizationRate *
    (1 - input.bufferRate);
  const baseHourlyRate =
    availableHours > 0 ? Math.round(requiredMonthlyRevenue / availableHours) : 0;

  return {
    requiredMonthlyRevenue,
    availableHours,
    baseHourlyRate,
    designRate: Math.round(baseHourlyRate * 1.2),
    machineRate: Math.round(baseHourlyRate),
    setupRate: Math.round(baseHourlyRate * 0.9),
    handworkRate: Math.round(baseHourlyRate * 0.8),
    finishingRate: Math.round(baseHourlyRate * 0.8),
  };
}

export function calcSummary(input: {
  materialCost: number;
  processingCost: number;
  setupCost: number;
  finishingCost: number;
  inspectionCost: number;
  packingCost: number;
  prototypeCost: number;
  outsourcingCost: number;
  consumableCost: number;
  riskCost: number;
  profitRate: number;
}) {
  const cost =
    input.materialCost +
    input.processingCost +
    input.setupCost +
    input.finishingCost +
    input.inspectionCost +
    input.packingCost +
    input.prototypeCost +
    input.outsourcingCost +
    input.consumableCost +
    input.riskCost;
  const profit = Math.round(cost * input.profitRate);
  const quoteAmount = cost + profit;
  const grossMarginRate = quoteAmount > 0 ? (profit / quoteAmount) * 100 : 0;

  return { cost, profit, quoteAmount, grossMarginRate };
}
