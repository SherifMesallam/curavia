"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminConsultationActions({
  consultationId,
  status,
}: {
  consultationId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [proposedAt, setProposedAt] = useState("");

  const act = async (action: string, extra?: object) => {
    setLoading(true);
    await fetch(`/api/consultations/${consultationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    router.refresh();
    setLoading(false);
    setProposing(false);
  };

  if (status === "CANCELLED" || status === "COMPLETED") return null;

  return (
    <div className="flex flex-col gap-2 shrink-0 min-w-[160px]">
      {status === "REQUESTED" && !proposing && (
        <Button size="sm" onClick={() => setProposing(true)} disabled={loading}>
          Propose a time
        </Button>
      )}

      {proposing && (
        <div className="space-y-2">
          <Input
            type="datetime-local"
            value={proposedAt}
            onChange={(e) => setProposedAt(e.target.value)}
            className="text-xs"
          />
          <div className="flex gap-1">
            <Button size="sm" className="flex-1" disabled={!proposedAt || loading}
              onClick={() => act("propose", { proposedAt })}>
              Send
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setProposing(false)}>✕</Button>
          </div>
        </div>
      )}

      {status === "CONFIRMED" && (
        <Button size="sm" onClick={() => act("complete")} disabled={loading}
          className="bg-teal-600 hover:bg-teal-700">
          Mark complete
        </Button>
      )}

      {status !== "CANCELLED" && (
        <Button size="sm" variant="outline" onClick={() => act("cancel")} disabled={loading}
          className="text-destructive border-destructive/30 hover:bg-destructive/10">
          Cancel
        </Button>
      )}
    </div>
  );
}
