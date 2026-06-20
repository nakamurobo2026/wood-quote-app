import { MaterialsMaster } from "@/components/master/SimpleMasters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const materials = await prisma.material.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-500">材料</p>
        <h1 className="text-3xl font-black">材料マスター</h1>
      </div>
      <MaterialsMaster materials={materials} />
    </div>
  );
}
