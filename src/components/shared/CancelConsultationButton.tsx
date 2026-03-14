"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CancelConsultationButtonProps {
  consultationRequestId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function CancelConsultationButton({
  consultationRequestId,
  variant = "outline",
  size = "sm",
}: CancelConsultationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Cancel this consultation request?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/consultations/${consultationRequestId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleCancel} disabled={loading}>
      {loading ? "Cancelling..." : "Cancel"}
    </Button>
  );
}
