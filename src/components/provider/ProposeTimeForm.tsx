"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProposeTimeFormProps {
  consultationRequestId: string;
}

export function ProposeTimeForm({ consultationRequestId }: ProposeTimeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      alert("Please enter date and time");
      return;
    }
    const proposedAt = new Date(`${date}T${time}`).toISOString();
    setLoading(true);
    try {
      const res = await fetch(`/api/consultations/${consultationRequestId}/propose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposedAt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to propose time");
      router.refresh();
      setDate("");
      setTime("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to propose time");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="space-y-1">
        <Label htmlFor="date" className="text-xs">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="time" className="text-xs">Time</Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="h-9"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Proposing..." : "Propose time"}
      </Button>
    </form>
  );
}
