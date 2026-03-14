"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ConfirmConsultationButtonProps {
  consultationRequestId: string;
}

export function ConfirmConsultationButton({ consultationRequestId }: ConfirmConsultationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consultations/${consultationRequestId}/confirm`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to confirm");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to confirm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={handleConfirm} disabled={loading}>
      {loading ? "Confirming..." : "Confirm time"}
    </Button>
  );
}
