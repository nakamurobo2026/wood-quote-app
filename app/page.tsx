import { EstimateListActions } from "@/components/estimate/EstimateListActions";
import { LinkButton } from "@/components/ui/Button";
import { dateText, percent, yen } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EstimatesPage() {
  const estimates = await prisma.estimate.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-gray-500">見積</p>
          <h1 className="text-3xl font-black">見積一覧</h1>
        </div>
        <LinkButton href="/estimates/new">新規見積</LinkButton>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100 text-left text-xs text-gray-600">
                <th className="px-5 py-4 font-bold">見積名</th>
                <th className="px-5 py-4 font-bold">顧客名</th>
                <th className="px-5 py-4 font-bold">更新日</th>
                <th className="px-4 py-4 text-right font-bold">見積金額</th>
                <th className="px-4 py-4 text-right font-bold">見積利益率</th>
                <th className="px-4 py-4 font-bold">操作</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((estimate) => (
                <tr key={estimate.id} className="border-b bg-white last:border-b-0 hover:bg-gray-50">
                  <td className="px-5 py-5">
                    <p className="text-base font-bold">{estimate.name}</p>
                  </td>
                  <td className="px-5 py-5 text-gray-700">{estimate.customerName || "-"}</td>
                  <td className="px-5 py-5">
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-sm font-bold text-gray-700">
                      {dateText(estimate.updatedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right text-2xl font-bold tabular-nums text-ink">
                    {yen(estimate.quoteAmount)}
                  </td>
                  <td className="px-4 py-5 text-right">
                    <span className="inline-flex min-w-16 justify-center rounded-md bg-gray-100 px-2 py-1 text-lg font-black tabular-nums text-gray-900">
                      {percent(estimate.grossMarginRate)}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <EstimateListActions id={estimate.id} />
                  </td>
                </tr>
              ))}
              {estimates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                    まだ見積がありません。新規見積から作成してください。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
