"use client";

import { QuoteType } from "@prisma/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, NumberField, SelectField, TextArea } from "@/components/ui/Field";
import {
  calcMaterial,
  calcProcessing,
  calcPrototype,
  calcSummary,
  type MaterialInput,
  type ProcessingInput,
  type PrototypeInput,
} from "@/lib/calculations";
import { percent, yen } from "@/lib/format";

type EstimateEditorState = {
  id?: string;
  name: string;
  customerName: string;
  drawingFileName: string;
  memo: string;
  quoteType: QuoteType;
  issuedAt: string;
  expiresAt: string;
  quoteNote: string;
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
    memo: string;
  };
  lots: { quantity: number }[];
};

type SettingRates = {
  machineRate: number;
  setupRate: number;
  handworkRate: number;
  finishingRate: number;
  designRate: number;
};

const tabs = [
  { id: "materials", label: "材料" },
  { id: "processing", label: "加工時間" },
  { id: "lot", label: "試作・ロット" },
  { id: "actual", label: "実績" },
  { id: "quote", label: "見積書" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function defaultEstimate(rates: SettingRates): EstimateEditorState {
  const today = new Date();
  const expires = new Date(today);
  expires.setDate(today.getDate() + 14);

  return {
    name: "",
    customerName: "",
    drawingFileName: "",
    memo: "",
    quoteType: "NORMAL",
    issuedAt: toDateInput(today),
    expiresAt: toDateInput(expires),
    quoteNote: "",
    outsourcingCost: 0,
    consumableCost: 0,
    riskCost: 0,
    profitRate: 0.3,
    materials: [emptyMaterial()],
    processing: {
      requiredQuantity: 1,
      partsPerRun: 1,
      minutesPerRun: 0,
      setupMinutes: 0,
      toolChangeMinutes: 0,
      finishingMinutes: 0,
      inspectionMinutes: 0,
      packingMinutes: 0,
      machineRate: rates.machineRate,
      setupRate: rates.setupRate,
      handworkRate: rates.handworkRate,
      finishingRate: rates.finishingRate,
    },
    prototype: {
      dataCheckCost: 0,
      designCost: 0,
      conditionTestCost: 0,
      jigReviewCost: 0,
      revisionCost: 0,
      prototypeRiskCost: 0,
    },
    actual: {
      actualWorkMinutes: 0,
      actualMaterialCost: 0,
      memo: "",
    },
    lots: [{ quantity: 1 }, { quantity: 5 }, { quantity: 10 }, { quantity: 30 }, { quantity: 50 }, { quantity: 100 }],
  };
}

export function EstimateEditor({
  initial,
  rates,
}: {
  initial?: EstimateEditorState;
  rates: SettingRates;
}) {
  const router = useRouter();
  const [form, setForm] = useState<EstimateEditorState>(initial ?? defaultEstimate(rates));
  const [activeTab, setActiveTab] = useState<TabId>("materials");
  const [saving, setSaving] = useState(false);

  const calculated = useMemo(() => {
    const materialRows = form.materials.map((row) => ({ ...row, ...calcMaterial(row) }));
    const materialCost = materialRows.reduce((sum, row) => sum + row.totalCost, 0);
    const processing = calcProcessing(form.processing);
    const prototypeCost = calcPrototype(form.prototype);
    const summary = calcSummary({
      materialCost,
      processingCost: processing.processingCost,
      setupCost: processing.setupCost,
      finishingCost: processing.finishingCost,
      inspectionCost: processing.inspectionCost,
      packingCost: processing.packingCost,
      prototypeCost,
      outsourcingCost: form.outsourcingCost,
      consumableCost: form.consumableCost,
      riskCost: form.riskCost + form.prototype.prototypeRiskCost,
      profitRate: form.profitRate,
    });
    const unitCostBase =
      materialCost +
      processing.processingCost +
      processing.setupCost +
      processing.finishingCost +
      processing.inspectionCost +
      processing.packingCost +
      form.outsourcingCost +
      form.consumableCost;
    const initialCost = prototypeCost + form.riskCost;
    const lots = form.lots.map((row) => {
      const cost = unitCostBase * row.quantity + initialCost;
      const profit = Math.round(cost * form.profitRate);
      const totalPrice = cost + profit;
      return {
        ...row,
        cost,
        profit,
        totalPrice,
        unitPrice: row.quantity > 0 ? Math.round(totalPrice / row.quantity) : 0,
        profitRate: totalPrice > 0 ? (profit / totalPrice) * 100 : 0,
      };
    });
    return { materialRows, materialCost, processing, prototypeCost, summary, lots };
  }, [form]);

  function update<K extends keyof EstimateEditorState>(key: K, value: EstimateEditorState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateMaterial(index: number, key: keyof MaterialInput, value: string) {
    setForm((current) => ({
      ...current,
      materials: current.materials.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: numericMaterialKeys.has(key) ? Number(value) || 0 : value } : row,
      ),
    }));
  }

  function updateProcessing(key: keyof ProcessingInput, value: string) {
    setForm((current) => ({
      ...current,
      processing: { ...current.processing, [key]: Number(value) || 0 },
    }));
  }

  function updatePrototype(key: keyof PrototypeInput, value: string) {
    setForm((current) => ({
      ...current,
      prototype: { ...current.prototype, [key]: Number(value) || 0 },
    }));
  }

  function updateActual(
    key: keyof EstimateEditorState["actual"],
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      actual: {
        ...current.actual,
        [key]: key === "memo" ? value : Number(value) || 0,
      },
    }));
  }

  async function save() {
    setSaving(true);
    const response = await fetch(form.id ? `/api/estimates/${form.id}` : "/api/estimates", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const saved = await response.json();
    setSaving(false);
    if (!form.id) {
      router.replace(`/estimates/${saved.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 space-y-5">
        <div className="rounded border border-gray-200 bg-white p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="見積名" value={form.name} onChange={(e) => update("name", e.target.value)} />
            <Field
              label="顧客名"
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value)}
            />
            <Field
              label="図面ファイル"
              value={form.drawingFileName}
              placeholder="example.pdf"
              onChange={(e) => update("drawingFileName", e.target.value)}
            />
            <SelectField
              label="見積タイプ"
              value={form.quoteType}
              onChange={(e) => update("quoteType", e.target.value as QuoteType)}
            >
              <option value="NORMAL">通常</option>
              <option value="PROTOTYPE">試作</option>
              <option value="LOT">ロット</option>
              <option value="PROTOTYPE_AND_MASS_PRODUCTION">試作＋量産</option>
            </SelectField>
            <TextArea
              className="lg:col-span-2"
              label="メモ"
              value={form.memo}
              onChange={(e) => update("memo", e.target.value)}
            />
          </div>
        </div>

        <div className="rounded border border-gray-200 bg-white">
          <div className="flex overflow-x-auto border-b border-gray-200 px-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`h-12 border-b-2 px-4 text-sm font-bold ${
                  activeTab === tab.id
                    ? "border-ink text-ink"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === "materials" ? (
              <MaterialTab
                rows={form.materials}
                calculatedRows={calculated.materialRows}
                onChange={updateMaterial}
                onAdd={() => update("materials", [...form.materials, emptyMaterial()])}
                onRemove={(index) =>
                  update(
                    "materials",
                    form.materials.filter((_, rowIndex) => rowIndex !== index),
                  )
                }
              />
            ) : null}
            {activeTab === "processing" ? (
              <ProcessingTab form={form.processing} calc={calculated.processing} onChange={updateProcessing} />
            ) : null}
            {activeTab === "lot" ? (
              <PrototypeLotTab
                form={form}
                lots={calculated.lots}
                onPrototypeChange={updatePrototype}
                onChangeNumber={(key, value) => update(key, Number(value) as never)}
                onLotChange={(index, quantity) =>
                  update(
                    "lots",
                    form.lots.map((row, rowIndex) =>
                      rowIndex === index ? { quantity: Number(quantity) || 0 } : row,
                    ),
                  )
                }
              />
            ) : null}
            {activeTab === "actual" ? (
              <ActualTab form={form.actual} onChange={updateActual} />
            ) : null}
            {activeTab === "quote" ? (
              <QuotePreviewTab
                form={form}
                summary={calculated.summary}
                calculated={calculated}
                onChange={(key, value) => update(key, value as never)}
              />
            ) : null}
          </div>
        </div>
      </section>

      <FixedSummary
        calculated={calculated}
        outsourcingCost={form.outsourcingCost}
        consumableCost={form.consumableCost}
        riskCost={form.riskCost + form.prototype.prototypeRiskCost}
        saving={saving}
        onSave={save}
      />
    </div>
  );
}

function ActualTab({
  form,
  onChange,
}: {
  form: EstimateEditorState["actual"];
  onChange: (key: keyof EstimateEditorState["actual"], value: string) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="実績加工時間（分）"
          value={form.actualWorkMinutes}
          onChange={(event) => onChange("actualWorkMinutes", event.target.value)}
        />
        <NumberField
          label="実績材料費"
          value={form.actualMaterialCost}
          onChange={(event) => onChange("actualMaterialCost", event.target.value)}
        />
        <TextArea
          className="sm:col-span-2"
          label="メモ"
          value={form.memo}
          onChange={(event) => onChange("memo", event.target.value)}
        />
      </div>
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 font-bold">実績メモ</h3>
        <p className="text-sm leading-6 text-gray-600">
          実績は保存のみ行い、今回の見積金額計算には反映しません。次回以降の見積精度確認に使うための記録欄です。
        </p>
      </div>
    </div>
  );
}

function MaterialTab({
  rows,
  calculatedRows,
  onChange,
  onAdd,
  onRemove,
}: {
  rows: MaterialInput[];
  calculatedRows: (MaterialInput & ReturnType<typeof calcMaterial>)[];
  onChange: (index: number, key: keyof MaterialInput, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-[1040px] w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs text-gray-600">
              <Th>材料名</Th>
              <Th>規格幅</Th>
              <Th>規格長さ</Th>
              <Th>単価</Th>
              <Th>送料</Th>
              <Th>ロス率</Th>
              <Th>必要幅</Th>
              <Th>必要長さ</Th>
              <Th>数量</Th>
              <Th>歩留まり</Th>
              <Th>予備率</Th>
              <Th>必要板数</Th>
              <Th>材料費合計</Th>
              <Th>{" "}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const calc = calculatedRows[index] as ReturnType<typeof calcMaterial>;
              return (
                <tr key={index} className="border-b">
                  <Td>
                    <Cell value={row.materialName} onChange={(v) => onChange(index, "materialName", v)} />
                  </Td>
                  <Td><Num value={row.sheetWidth} onChange={(v) => onChange(index, "sheetWidth", v)} /></Td>
                  <Td><Num value={row.sheetLength} onChange={(v) => onChange(index, "sheetLength", v)} /></Td>
                  <Td><Num value={row.unitPrice} onChange={(v) => onChange(index, "unitPrice", v)} /></Td>
                  <Td><Num value={row.shippingCost} onChange={(v) => onChange(index, "shippingCost", v)} /></Td>
                  <Td><Num step="0.01" value={row.lossRate} onChange={(v) => onChange(index, "lossRate", v)} /></Td>
                  <Td><Num value={row.requiredWidth} onChange={(v) => onChange(index, "requiredWidth", v)} /></Td>
                  <Td><Num value={row.requiredLength} onChange={(v) => onChange(index, "requiredLength", v)} /></Td>
                  <Td><Num value={row.quantity} onChange={(v) => onChange(index, "quantity", v)} /></Td>
                  <Td><Num step="0.01" value={row.yieldRate} onChange={(v) => onChange(index, "yieldRate", v)} /></Td>
                  <Td><Num step="0.01" value={row.extraRate} onChange={(v) => onChange(index, "extraRate", v)} /></Td>
                  <Td className="text-right font-semibold tabular-nums">{calc.requiredSheets}</Td>
                  <Td className="text-right font-semibold tabular-nums">{yen(calc.totalCost)}</Td>
                  <Td>
                    <button className="text-red-700" onClick={() => onRemove(index)}>削除</button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button variant="secondary" onClick={onAdd}>材料行を追加</Button>
    </div>
  );
}

function ProcessingTab({
  form,
  calc,
  onChange,
}: {
  form: ProcessingInput;
  calc: ReturnType<typeof calcProcessing>;
  onChange: (key: keyof ProcessingInput, value: string) => void;
}) {
  const fields: [keyof ProcessingInput, string][] = [
    ["requiredQuantity", "必要数量"],
    ["partsPerRun", "同時加工個数"],
    ["minutesPerRun", "1回の加工時間（分）"],
    ["setupMinutes", "段取り時間（分）"],
    ["toolChangeMinutes", "工具交換時間（分）"],
    ["finishingMinutes", "仕上げ時間（分）"],
    ["inspectionMinutes", "検品時間（分）"],
    ["packingMinutes", "梱包時間（分）"],
    ["machineRate", "機械加工単価"],
    ["setupRate", "段取り単価"],
    ["handworkRate", "手作業単価"],
    ["finishingRate", "仕上げ単価"],
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map(([key, label]) => (
          <NumberField key={key} label={label} value={form[key]} onChange={(e) => onChange(key, e.target.value)} />
        ))}
      </div>
      <div className="rounded border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 font-bold">自動計算</h3>
        <SummaryRow label="加工回数" value={`${calc.runCount} 回`} />
        <SummaryRow label="総加工時間" value={`${Math.round(calc.machineMinutes)} 分`} />
        <SummaryRow label="総作業時間" value={`${Math.round(calc.totalWorkMinutes)} 分`} />
      </div>
    </div>
  );
}

function PrototypeLotTab({
  form,
  lots,
  onPrototypeChange,
  onChangeNumber,
  onLotChange,
}: {
  form: EstimateEditorState;
  lots: { quantity: number; totalPrice: number; unitPrice: number; cost: number; profit: number; profitRate: number }[];
  onPrototypeChange: (key: keyof PrototypeInput, value: string) => void;
  onChangeNumber: (key: "outsourcingCost" | "consumableCost" | "riskCost" | "profitRate", value: string) => void;
  onLotChange: (index: number, quantity: string) => void;
}) {
  const protoFields: [keyof PrototypeInput, string][] = [
    ["dataCheckCost", "データ確認費"],
    ["designCost", "設計費"],
    ["conditionTestCost", "条件出し費"],
    ["jigReviewCost", "治具検討費"],
    ["revisionCost", "修正対応費"],
    ["prototypeRiskCost", "試作リスク費"],
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {protoFields.map(([key, label]) => (
          <NumberField key={key} label={label} value={form.prototype[key]} onChange={(e) => onPrototypeChange(key, e.target.value)} />
        ))}
        <NumberField label="外注費" value={form.outsourcingCost} onChange={(e) => onChangeNumber("outsourcingCost", e.target.value)} />
        <NumberField label="消耗品費" value={form.consumableCost} onChange={(e) => onChangeNumber("consumableCost", e.target.value)} />
        <NumberField label="リスク費" value={form.riskCost} onChange={(e) => onChangeNumber("riskCost", e.target.value)} />
        <NumberField label="利益率" step="0.01" value={form.profitRate} onChange={(e) => onChangeNumber("profitRate", e.target.value)} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs text-gray-600">
              <Th>数量</Th>
              <Th>総額</Th>
              <Th>単価</Th>
              <Th>原価</Th>
              <Th>利益</Th>
              <Th>利益率</Th>
            </tr>
          </thead>
          <tbody>
            {lots.map((row, index) => (
              <tr key={index} className="border-b">
                <Td><Num value={row.quantity} onChange={(v) => onLotChange(index, v)} /></Td>
                <Td className="text-right font-semibold tabular-nums">{yen(row.totalPrice)}</Td>
                <Td className="text-right tabular-nums">{yen(row.unitPrice)}</Td>
                <Td className="text-right tabular-nums">{yen(row.cost)}</Td>
                <Td className="text-right tabular-nums">{yen(row.profit)}</Td>
                <Td className="text-right tabular-nums">{percent(row.profitRate)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuotePreviewTab({
  form,
  summary,
  calculated,
  onChange,
}: {
  form: EstimateEditorState;
  summary: { quoteAmount: number; grossMarginRate: number; profit: number };
  calculated: {
    materialRows: (MaterialInput & ReturnType<typeof calcMaterial>)[];
    processing: ReturnType<typeof calcProcessing>;
    prototypeCost: number;
  };
  onChange: (key: keyof EstimateEditorState, value: string) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-4">
        <Field label="発行日" type="date" value={form.issuedAt} onChange={(e) => onChange("issuedAt", e.target.value)} />
        <Field label="有効期限" type="date" value={form.expiresAt} onChange={(e) => onChange("expiresAt", e.target.value)} />
        <TextArea label="備考" value={form.quoteNote} onChange={(e) => onChange("quoteNote", e.target.value)} />
      </div>
      <div className="rounded border border-gray-300 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">見積書</h2>
            <p className="mt-4 text-lg">{form.customerName || "顧客名未入力"} 御中</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>発行日: {form.issuedAt || "-"}</p>
            <p>有効期限: {form.expiresAt || "-"}</p>
          </div>
        </div>
        <p className="mb-6 text-xl font-bold">件名: {form.name || "無題の見積"}</p>
        <div className="mb-8 rounded bg-gray-100 p-4 text-right">
          <span className="mr-4 text-sm text-gray-600">見積金額</span>
          <span className="text-4xl font-bold tabular-nums">{yen(summary.quoteAmount)}</span>
        </div>
        <table className="w-full text-sm">
          <tbody>
            <PreviewRow label="材料費" value={yen(calculated.materialRows.reduce((s, r) => s + r.totalCost, 0))} />
            <PreviewRow label="加工費" value={yen(calculated.processing.processingCost)} />
            <PreviewRow label="段取り費" value={yen(calculated.processing.setupCost)} />
            <PreviewRow label="仕上げ・検品・梱包" value={yen(calculated.processing.finishingCost + calculated.processing.inspectionCost + calculated.processing.packingCost)} />
            <PreviewRow label="試作費" value={yen(calculated.prototypeCost)} />
            <PreviewRow label="利益" value={yen(summary.profit)} />
          </tbody>
        </table>
        {form.quoteNote ? <p className="mt-6 whitespace-pre-wrap text-sm text-gray-700">{form.quoteNote}</p> : null}
      </div>
    </div>
  );
}

function FixedSummary({
  calculated,
  outsourcingCost,
  consumableCost,
  riskCost,
  saving,
  onSave,
}: {
  calculated: {
    materialCost: number;
    processing: ReturnType<typeof calcProcessing>;
    prototypeCost: number;
    summary: { profit: number; quoteAmount: number; grossMarginRate: number };
  };
  outsourcingCost: number;
  consumableCost: number;
  riskCost: number;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <aside className="xl:sticky xl:top-6 xl:h-fit">
      <div className="rounded border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold">サマリー</h2>
        <div className="space-y-2 text-sm">
          <SummaryRow label="材料費" value={yen(calculated.materialCost)} />
          <SummaryRow label="加工費" value={yen(calculated.processing.processingCost)} />
          <SummaryRow label="段取り費" value={yen(calculated.processing.setupCost)} />
          <SummaryRow label="仕上げ費" value={yen(calculated.processing.finishingCost)} />
          <SummaryRow label="検品費" value={yen(calculated.processing.inspectionCost)} />
          <SummaryRow label="梱包費" value={yen(calculated.processing.packingCost)} />
          <SummaryRow label="試作費" value={yen(calculated.prototypeCost)} />
          <SummaryRow label="外注費" value={yen(outsourcingCost)} />
          <SummaryRow label="消耗品費" value={yen(consumableCost)} />
          <SummaryRow label="リスク費" value={yen(riskCost)} />
          <SummaryRow label="利益" value={yen(calculated.summary.profit)} />
        </div>
        <div className="mt-5 rounded bg-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-600">見積金額</p>
          <p className="mt-1 text-4xl font-bold tabular-nums">{yen(calculated.summary.quoteAmount)}</p>
          <p className="mt-2 text-sm text-gray-600">粗利率 {percent(calculated.summary.grossMarginRate)}</p>
        </div>
        <Button className="mt-5 w-full" onClick={onSave} disabled={saving}>
          {saving ? "保存中" : "保存"}
        </Button>
      </div>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b">
      <td className="py-3 text-gray-600">{label}</td>
      <td className="py-3 text-right font-semibold tabular-nums">{value}</td>
    </tr>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-2 py-2 font-semibold">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-2 py-2 ${className}`}>{children}</td>;
}

function Cell({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      className="h-9 w-32 rounded border border-gray-300 px-2 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Num({
  value,
  onChange,
  step = "1",
}: {
  value: number;
  onChange: (value: string) => void;
  step?: string;
}) {
  return (
    <input
      className="h-9 w-24 rounded border border-gray-300 px-2 text-right text-sm tabular-nums"
      type="number"
      step={step}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function emptyMaterial(): MaterialInput {
  return {
    materialName: "",
    category: "",
    thickness: 0,
    sheetWidth: 910,
    sheetLength: 1820,
    supplier: "",
    unitPrice: 0,
    shippingCost: 0,
    lossRate: 0.1,
    requiredWidth: 0,
    requiredLength: 0,
    quantity: 1,
    yieldRate: 0.85,
    extraRate: 0.1,
  };
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

const numericMaterialKeys = new Set<keyof MaterialInput>([
  "thickness",
  "sheetWidth",
  "sheetLength",
  "unitPrice",
  "shippingCost",
  "lossRate",
  "requiredWidth",
  "requiredLength",
  "quantity",
  "yieldRate",
  "extraRate",
]);
