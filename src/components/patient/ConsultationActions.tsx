"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ConsultationActions({
  consultationId,
  status,
  proposedAt,
}: {
  consultationId: string;
  status: string;
  proposedAt: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const act = async (action: string) => {
    setLoading(true);
    await fetch(`/api/consultations/${consultationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
    setLoading(false);
  };

  if (status === "CANCELLED" || status === "COMPLETED") return null;

  return (
    <div className="flex flex-col gap-2 shrink-0">
      {status === "PENDING_CONFIRMATION" && proposedAt && (
        <Button size="sm" onClick={() => act("confirm")} disabled={loading}
          className="bg-teal-600 hover:bg-teal-700">
          ✓ Confirm time
        </Button>
      )}
      {(status === "REQUESTED" || status === "PENDING_CONFIRMATION") && (
        <Button size="sm" variant="outline" onClick={() => act("cancel")} disabled={loading}
          className="text-destructive border-destructive/30 hover:bg-destructive/10">
          Cancel
        </Button>
      )}
    </div>
  );
}
