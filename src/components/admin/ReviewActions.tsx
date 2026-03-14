"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ReviewActionsProps {
  reviewId: string;
  status: string;
}

export function ReviewActions({ reviewId, status }: ReviewActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "APPROVED" && (
        <Button
          size="sm"
          onClick={() => updateStatus("APPROVED")}
          disabled={!!loading}
        >
          {loading === "APPROVED" ? "..." : "Approve"}
        </Button>
      )}
      {status !== "HIDDEN" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus("HIDDEN")}
          disabled={!!loading}
        >
          {loading === "HIDDEN" ? "..." : "Hide"}
        </Button>
      )}
      {status !== "FLAGGED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus("FLAGGED")}
          disabled={!!loading}
        >
          {loading === "FLAGGED" ? "..." : "Flag"}
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => updateStatus("REJECTED")}
          disabled={!!loading}
        >
          {loading === "REJECTED" ? "..." : "Reject"}
        </Button>
      )}
    </div>
  );
}
