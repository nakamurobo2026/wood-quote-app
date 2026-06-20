import { ConditionsMaster } from "@/components/master/SimpleMasters";
import { prisma } from "@/lib/prisma";

export default async function ConditionsPage() {
  const conditions = await prisma.machiningCondition.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-500">条件DB</p>
        <h1 className="text-3xl font-bold">加工条件</h1>
      </div>
      <ConditionsMaster conditions={conditions} />
    </div>
  );
}
