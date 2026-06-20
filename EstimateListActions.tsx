"use client";

import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/Button";

export function EstimateListActions({ id }: { id: string }) {
  const router = useRouter();

  async function duplicateEstimate() {
    const response = await fetch(`/api/estimates/${id}/duplicate`, { method: "POST" });
    const copy = await response.json();
    router.push(`/estimates/${copy.id}`);
  }

  async function deleteEstimate() {
    if (!confirm("この見積を削除しますか？")) return;
    await fetch(`/api/estimates/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <LinkButton href={`/estimates/${id}`} variant="secondary" className="h-9 px-3">
        編集
      </LinkButton>
      <Button variant="secondary" className="h-9 px-3" onClick={duplicateEstimate}>
        複製
      </Button>
      <Button variant="danger" className="h-9 px-3" onClick={deleteEstimate}>
        削除
      </Button>
    </div>
  );
}
