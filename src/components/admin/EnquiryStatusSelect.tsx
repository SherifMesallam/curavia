"use client";

import { useState, useTransition } from "react";

const STATUSES = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "MATCHED", label: "Matched" },
  { value: "CONSULTATION_REQUESTED", label: "Consultation requested" },
  { value: "PACKAGE_PREPARED", label: "Package prepared" },
  { value: "CLOSED", label: "Closed" },
];

export function EnquiryStatusSelect({
  caseId,
  currentStatus,
}: {
  caseId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setStatus(next);
    startTransition(async () => {
      await fetch(`/api/admin/enquiries/${caseId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    });
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
