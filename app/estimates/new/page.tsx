import { EstimateEditor } from "@/components/estimate/EstimateEditor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewEstimatePage() {
  const [setting, materials] = await Promise.all([
    prisma.setting.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    }),
    prisma.material.findMany({ orderBy: [{ materialName: "asc" }, { thickness: "asc" }] }),
  ]);

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-500">新規見積</p>
        <h1 className="text-3xl font-black">3分で見積を作る</h1>
      </div>
      <EstimateEditor rates={setting} materials={materials} />
    </div>
  );
}
