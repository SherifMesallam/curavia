"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VettingActionsProps {
  entityType: "doctor" | "clinic";
  entityId: string;
}

export function VettingActions({ entityType, entityId }: VettingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | "request_info" | null>(null);
  const [requestNote, setRequestNote] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleDecision = async (
    decision: "approve" | "reject" | "request_info",
    note?: string
  ) => {
    setLoading(decision);
    try {
      const res = await fetch("/api/admin/vetting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          decision,
          note: decision === "request_info" ? note : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      router.push("/admin/vetting");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h2 className="font-semibold">Actions</h2>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleDecision("approve")}
          disabled={loading !== null}
        >
          {loading === "approve" ? "Approving..." : "Approve (verify)"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleDecision("reject")}
          disabled={loading !== null}
        >
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </Button>
        {!showRequestForm ? (
          <Button
            variant="outline"
            onClick={() => setShowRequestForm(true)}
            disabled={loading !== null}
          >
            Request additional information
          </Button>
        ) : (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Message to provider</label>
              <Input
                placeholder="Describe what information is needed..."
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                className="min-w-[200px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleDecision("request_info", requestNote)}
                disabled={loading !== null || !requestNote.trim()}
              >
                {loading === "request_info" ? "Sending..." : "Send request"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRequestForm(false);
                  setRequestNote("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Approved providers become visible in the public marketplace.
      </p>
    </div>
  );
}
