"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, NumberField, TextArea } from "@/components/ui/Field";
import { yen } from "@/lib/format";

type MaterialRow = {
  id: string;
  materialName: string;
  category: string | null;
  thickness: number | null;
  width: number;
  length: number;
  supplier: string | null;
  unitPrice: number;
};

type ConditionRow = {
  id: string;
  material: string;
  toolDiameter: number | null;
  toolType: string | null;
  rpm: number | null;
  feedRate: number | null;
  depthPerPass: number | null;
  stepover: number | null;
  result: string | null;
  memo: string | null;
};

export function MaterialsMaster({ materials }: { materials: MaterialRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    materialName: "",
    category: "",
    thickness: 0,
    width: 910,
    length: 1820,
    supplier: "",
    unitPrice: 0,
    shippingCost: 0,
    lossRate: 0,
  });

  async function add() {
    await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ...form, materialName: "", unitPrice: 0 });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/materials/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">材料を追加</h2>
        <div className="space-y-3">
          <Field label="材料名" value={form.materialName} onChange={(e) => setForm({ ...form, materialName: e.target.value })} />
          <Field label="カテゴリ" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <NumberField label="厚み" value={form.thickness} onChange={(e) => setForm({ ...form, thickness: Number(e.target.value) || 0 })} />
          <NumberField label="規格幅" value={form.width} onChange={(e) => setForm({ ...form, width: Number(e.target.value) || 0 })} />
          <NumberField label="規格長さ" value={form.length} onChange={(e) => setForm({ ...form, length: Number(e.target.value) || 0 })} />
          <Field label="仕入先" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          <NumberField label="単価" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) || 0 })} />
          <Button className="w-full" onClick={add}>追加</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[840px] w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100 text-left text-xs font-bold text-gray-600">
                <th className="px-4 py-3">材料名</th>
                <th className="px-4 py-3">カテゴリ</th>
                <th className="px-4 py-3 text-right">厚み</th>
                <th className="px-4 py-3 text-right">規格</th>
                <th className="px-4 py-3">仕入先</th>
                <th className="px-4 py-3 text-right">単価</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {materials.map((row) => (
                <tr key={row.id} className="border-b bg-white last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{row.materialName}</td>
                  <td className="px-4 py-3">{row.category || "-"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.thickness ?? "-"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.width} x {row.length}</td>
                  <td className="px-4 py-3">{row.supplier || "-"}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{yen(row.unitPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-md px-2 py-1 font-bold text-red-700 hover:bg-red-50" onClick={() => remove(row.id)}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ConditionsMaster({ conditions }: { conditions: ConditionRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    material: "",
    toolDiameter: 6,
    toolType: "",
    rpm: 18000,
    feedRate: 0,
    depthPerPass: 0,
    stepover: 0,
    result: "",
    memo: "",
  });

  async function add() {
    await fetch("/api/conditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ...form, material: "", result: "", memo: "" });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/conditions/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">条件を追加</h2>
        <div className="space-y-3">
          <Field label="材料" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          <NumberField label="工具径" value={form.toolDiameter} onChange={(e) => setForm({ ...form, toolDiameter: Number(e.target.value) || 0 })} />
          <Field label="工具種別" value={form.toolType} onChange={(e) => setForm({ ...form, toolType: e.target.value })} />
          <NumberField label="rpm" value={form.rpm} onChange={(e) => setForm({ ...form, rpm: Number(e.target.value) || 0 })} />
          <NumberField label="feedRate" value={form.feedRate} onChange={(e) => setForm({ ...form, feedRate: Number(e.target.value) || 0 })} />
          <NumberField label="depthPerPass" value={form.depthPerPass} onChange={(e) => setForm({ ...form, depthPerPass: Number(e.target.value) || 0 })} />
          <NumberField label="stepover" value={form.stepover} onChange={(e) => setForm({ ...form, stepover: Number(e.target.value) || 0 })} />
          <Field label="結果" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} />
          <TextArea label="メモ" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
          <Button className="w-full" onClick={add}>追加</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100 text-left text-xs font-bold text-gray-600">
                <th className="px-4 py-3">材料</th>
                <th className="px-4 py-3 text-right">工具径</th>
                <th className="px-4 py-3">工具</th>
                <th className="px-4 py-3 text-right">rpm</th>
                <th className="px-4 py-3 text-right">feed</th>
                <th className="px-4 py-3">結果</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {conditions.map((row) => (
                <tr key={row.id} className="border-b bg-white last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{row.material}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.toolDiameter ?? "-"}</td>
                  <td className="px-4 py-3">{row.toolType || "-"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.rpm ?? "-"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.feedRate ?? "-"}</td>
                  <td className="px-4 py-3">{row.result || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-md px-2 py-1 font-bold text-red-700 hover:bg-red-50" onClick={() => remove(row.id)}>削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
