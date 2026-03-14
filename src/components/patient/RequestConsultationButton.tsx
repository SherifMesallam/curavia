"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RequestConsultationButtonProps {
  inquiryCaseId: string;
  doctorId: string;
  doctorName: string;
  disabled?: boolean;
}

export function RequestConsultationButton({
  inquiryCaseId,
  doctorId,
  doctorName,
  disabled = false,
}: RequestConsultationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleRequest = async () => {
    if (showForm) {
      setLoading(true);
      try {
        const res = await fetch("/api/consultations/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inquiryCaseId,
            doctorId,
            patientNotes: notes || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Request failed");
        router.refresh();
        setShowForm(false);
        setNotes("");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Request failed");
      } finally {
        setLoading(false);
      }
    } else {
      setShowForm(true);
    }
  };

  if (showForm) {
    return (
      <div className="mt-2 space-y-2">
        <textarea
          placeholder="Optional message for the doctor..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={2}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleRequest} disabled={loading}>
            {loading ? "Submitting..." : "Submit request"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowForm(false)} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={handleRequest} disabled={disabled}>
      Request consultation
    </Button>
  );
}
