import { SettingsForm } from "@/components/settings/SettingsForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const setting = await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-500">設定</p>
        <h1 className="text-3xl font-black">固定費を確認する</h1>
      </div>
      <SettingsForm initial={setting} />
    </div>
  );
}
