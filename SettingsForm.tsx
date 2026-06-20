"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/Field";
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

export function SettingsForm({ initial }: { initial: SettingFormState }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const rates = useMemo(() => calcSettingRates(form), [form]);

  function setNumber(key: keyof SettingFormState, value: string) {
    setForm((current) => ({ ...current, [key]: Number(value) || 0 }));
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="rounded border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold">月固定費</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moneyFields.map(([key, label]) => (
              <NumberField
                key={key}
                label={label}
                value={form[key]}
                onChange={(event) => setNumber(key, event.target.value)}
                className="number-input"
              />
            ))}
          </div>
        </div>

        <div className="rounded border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold">稼働条件</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              label="営業日数"
              value={form.workingDays}
              onChange={(event) => setNumber("workingDays", event.target.value)}
            />
            <NumberField
              label="1日作業時間"
              value={form.hoursPerDay}
              onChange={(event) => setNumber("hoursPerDay", event.target.value)}
            />
            <NumberField
              label="加工稼働率"
              step="0.01"
              value={form.utilizationRate}
              onChange={(event) => setNumber("utilizationRate", event.target.value)}
            />
            <NumberField
              label="予備率"
              step="0.01"
              value={form.bufferRate}
              onChange={(event) => setNumber("bufferRate", event.target.value)}
            />
          </div>
        </div>
      </section>

      <aside className="xl:sticky xl:top-6 xl:h-fit">
        <div className="rounded border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold">自動生成単価</h2>
          <dl className="space-y-3 text-sm">
            <Row label="必要月商" value={yen(rates.requiredMonthlyRevenue)} />
            <Row label="利用可能時間" value={`${Math.round(rates.availableHours * 10) / 10} h`} />
            <Row large label="基準時間単価" value={yen(rates.baseHourlyRate)} />
            <Row label="設計単価" value={yen(rates.designRate)} />
            <Row label="機械加工単価" value={yen(rates.machineRate)} />
            <Row label="段取り単価" value={yen(rates.setupRate)} />
            <Row label="手作業単価" value={yen(rates.handworkRate)} />
            <Row label="仕上げ単価" value={yen(rates.finishingRate)} />
          </dl>
          <Button className="mt-5 w-full" onClick={save} disabled={saving}>
            {saving ? "保存中" : "保存"}
          </Button>
          {saved ? <p className="mt-3 text-center text-sm text-green-700">保存しました</p> : null}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-gray-100 pb-2">
      <dt className="text-gray-600">{label}</dt>
      <dd className={large ? "text-2xl font-bold tabular-nums" : "font-semibold tabular-nums"}>
        {value}
      </dd>
    </div>
  );
}
