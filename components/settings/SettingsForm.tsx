"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { calcSettingRates } from "@/lib/calculations";
import { yen } from "@/lib/format";

type SettingFormState = {
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
};

const moneyFields: [keyof SettingFormState, string][] = [
  ["rent", "家賃"],
  ["electricity", "電気代"],
  ["communication", "通信費"],
  ["software", "ソフト代"],
  ["vehicle", "車両費"],
  ["insurance", "保険"],
  ["consumables", "消耗品"],
  ["loanRepayment", "借入返済"],
  ["taxReserve", "税金積立"],
  ["livingCost", "生活費"],
  ["desiredProfit", "欲しい利益"],
];

const workFields: [keyof SettingFormState, string, string, string][] = [
  ["workingDays", "営業日数", "日/月", "1か月の稼働日"],
  ["hoursPerDay", "作業時間", "h/日", "1日の作業時間"],
  ["utilizationRate", "稼働率", "%", "加工に使える割合"],
  ["bufferRate", "予備率", "%", "余裕として除く割合"],
];

export function SettingsForm({ initial }: { initial: SettingFormState }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const rates = useMemo(() => calcSettingRates(form), [form]);

  function setNumber(key: keyof SettingFormState, value: string, mode: "number" | "percent" = "number") {
    const next = Number(value) || 0;
    setForm((current) => ({ ...current, [key]: mode === "percent" ? next / 100 : next }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="必要月商" value={yen(rates.requiredMonthlyRevenue)} />
          <Metric label="時間単価" value={`${yen(rates.baseHourlyRate)} / h`} strong />
          <Metric label="分単価" value={`${yen(Math.round(rates.baseHourlyRate / 60))} / 分`} strong />
        </div>

        <div className="rounded-md border border-sky-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h2 className="text-base font-black text-gray-950">月固定費</h2>
              <p className="text-xs font-semibold text-gray-500">毎月必要な金額をまとめて入力</p>
            </div>
            <p className="text-right text-2xl font-black tabular-nums text-skyline-700">{yen(rates.requiredMonthlyRevenue)}</p>
          </div>
          <div className="grid divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="divide-y divide-gray-100">
              {moneyFields.slice(0, 6).map(([key, label]) => (
                <CompactMoneyRow key={key} label={label} value={form[key]} onChange={(value) => setNumber(key, value)} />
              ))}
            </div>
            <div className="divide-y divide-gray-100">
              {moneyFields.slice(6).map(([key, label]) => (
                <CompactMoneyRow key={key} label={label} value={form[key]} onChange={(value) => setNumber(key, value)} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-sky-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-gray-950">稼働条件</h2>
              <p className="text-xs font-semibold text-gray-500">固定費を時間・分単価に直すための前提</p>
            </div>
            <div className="rounded-md bg-sky-50 px-3 py-2 text-right">
              <p className="text-[11px] font-bold text-gray-500">利用可能時間</p>
              <p className="text-lg font-black tabular-nums text-gray-950">{Math.round(rates.availableHours * 10) / 10} h</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {workFields.map(([key, label, unit, help]) => {
              const isPercent = key === "utilizationRate" || key === "bufferRate";
              const value = isPercent ? Math.round(form[key] * 100) : form[key];
              return (
                <CompactCondition
                  key={key}
                  label={label}
                  help={help}
                  unit={unit}
                  value={value}
                  onChange={(next) => setNumber(key, next, isPercent ? "percent" : "number")}
                />
              );
            })}
          </div>
        </div>
      </section>

      <aside className="xl:sticky xl:top-6 xl:h-fit">
        <div className="rounded-md border border-sky-100 bg-white p-4 shadow-lg shadow-sky-100/70">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-black">参考単価</h2>
              <p className="text-xs font-semibold text-gray-500">見積入力時の目安</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-black ${saved ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {saving ? "保存中" : saved ? "保存済み" : "未保存"}
            </span>
          </div>
          <dl className="space-y-2 text-sm">
            <RateRow label="時間" value={`${yen(rates.baseHourlyRate)} / h`} />
            <RateRow label="分" value={`${yen(Math.round(rates.baseHourlyRate / 60))} / 分`} primary />
            <Row label="月商" value={yen(rates.requiredMonthlyRevenue)} />
            <Row label="稼働" value={`${Math.round(rates.availableHours * 10) / 10} h`} />
          </dl>
          <p className="mt-4 rounded-md bg-sky-50 p-3 text-xs font-semibold leading-5 text-gray-600">
            固定費は参考単価の算出だけに使います。見積の加工単価には自動反映しません。
          </p>
          <Button className="mt-4 w-full" onClick={save} disabled={saving}>
            {saving ? "保存中" : "保存する"}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md border border-sky-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-bold text-gray-500">{label}</p>
      <p className={`mt-1 truncate font-black tabular-nums ${strong ? "text-2xl text-gray-950" : "text-xl text-skyline-700"}`}>
        {value}
      </p>
    </div>
  );
}

function CompactMoneyRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid grid-cols-[92px_minmax(0,1fr)_24px] items-center gap-2 px-4 py-2.5">
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-0 rounded-md border border-sky-100 bg-sky-50/40 px-2 text-right text-base font-bold tabular-nums outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
      />
      <span className="text-xs font-bold text-gray-500">円</span>
    </label>
  );
}

function CompactCondition({
  label,
  help,
  unit,
  value,
  onChange,
}: {
  label: string;
  help: string;
  unit: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-md border border-gray-100 bg-gray-50 p-3">
      <span className="block text-sm font-black text-gray-800">{label}</span>
      <span className="mb-2 block text-[11px] font-semibold text-gray-500">{help}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 min-w-0 flex-1 rounded-md border border-sky-100 bg-white px-2 text-right text-base font-bold tabular-nums outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
        <span className="w-10 text-xs font-bold text-gray-500">{unit}</span>
      </div>
    </label>
  );
}

function RateRow({ label, value, primary = false }: { label: string; value: string; primary?: boolean }) {
  return (
    <div className={`rounded-md p-3 ${primary ? "bg-gray-950 text-white" : "bg-sky-50 text-gray-950"}`}>
      <dt className={`text-xs font-bold ${primary ? "text-sky-100" : "text-gray-500"}`}>{label}</dt>
      <dd className="mt-1 text-2xl font-black tabular-nums">{value}</dd>
    </div>
  );
}

function Row({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-gray-100 py-1.5">
      <dt className="text-xs font-bold text-gray-500">{label}</dt>
      <dd className={large ? "text-2xl font-bold tabular-nums" : "font-semibold tabular-nums"}>
        {value}
      </dd>
    </div>
  );
}
