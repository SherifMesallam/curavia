"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
  specialization: { name: string } | null;
  clinic: { name: string; city: string } | null;
  yearsExperience: number | null;
};

export function BookConsultationForm({
  doctors,
  preselectedDoctorId,
}: {
  doctors: Doctor[];
  preselectedDoctorId: string | null;
}) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState(preselectedDoctorId ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const selected = doctors.find((d) => d.id === doctorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;
    setSubmitting(true);
    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, notes }),
    });
    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      alert(data.error ?? "Booking failed");
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-14 w-14 text-teal-600 mx-auto mb-4" />
        <h2 className="font-bold text-xl mb-2">Consultation requested!</h2>
        <p className="text-muted-foreground mb-6">
          {selected ? `Your request to consult with Dr. ${selected.firstName} ${selected.lastName} has been received.` : "Your consultation request has been received."}
          {" "}The Curavia team will propose a time and confirm with you shortly.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.push("/patient/consultations")}>
            My consultations
          </Button>
          <Button onClick={() => router.push("/patient/dashboard")}>Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Doctor select */}
      <div className="space-y-2">
        <Label>Choose a doctor *</Label>
        <select
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select a doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              Dr. {d.firstName} {d.lastName}
              {d.specialization ? ` · ${d.specialization.name}` : ""}
              {d.clinic ? ` · ${d.clinic.name}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Selected doctor card */}
      {selected && (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-0.5">
          <p className="font-semibold">Dr. {selected.firstName} {selected.lastName}</p>
          {selected.specialization && <p className="text-muted-foreground">{selected.specialization.name}</p>}
          {selected.clinic && <p className="text-muted-foreground">{selected.clinic.name} · {selected.clinic.city}</p>}
          {selected.yearsExperience != null && <p className="text-muted-foreground">{selected.yearsExperience} years of experience</p>}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label>What would you like to discuss? <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Briefly describe what you'd like to discuss — a second opinion, procedure planning, questions about your case..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button type="submit" className="w-full" disabled={!doctorId || submitting}>
        {submitting ? "Booking…" : "Request consultation"}
      </Button>
    </form>
  );
}
