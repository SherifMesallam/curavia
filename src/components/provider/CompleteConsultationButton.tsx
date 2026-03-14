"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CompleteConsultationButtonProps {
  consultationRequestId: string;
}

export function CompleteConsultationButton({ consultationRequestId }: CompleteConsultationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!confirm("Mark this consultation as completed?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/consultations/${consultationRequestId}/complete`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to complete");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleComplete} disabled={loading}>
      {loading ? "Completing..." : "Mark completed"}
    </Button>
  );
}
