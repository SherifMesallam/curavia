"use client";

import { useState } from "react";
import { CheckCircle, XCircle, UserCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  specialization: { name: string } | null;
  clinic: { name: string; city: string } | null;
  yearsExperience: number | null;
};

type TravelPackage = {
  name: string;
  price: number | string;
  currency: string;
  description: string | null;
  inclusions: string | null;
  exclusions: string | null;
  recommendedDoctors: string | null;
};

function parseList(json: string | null): string[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

export function PackageView({
  travelPackage,
  recommendedDoctors,
  inquiryId,
  initialSelectedDoctorId,
  preselectedDoctorId,
}: {
  travelPackage: TravelPackage;
  recommendedDoctors: Doctor[];
  inquiryId: string;
  initialSelectedDoctorId: string | null;
  preselectedDoctorId: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedDoctorId ?? preselectedDoctorId ?? null
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSelectedDoctorId);

  const inclusions = parseList(travelPackage.inclusions);
  const exclusions = parseList(travelPackage.exclusions);
  const price = Number(travelPackage.price).toLocaleString();

  const handleSelect = async (doctorId: string) => {
    setSelectedId(doctorId);
    setSaving(true);
    const res = await fetch(`/api/inquiries/${inquiryId}/select-doctor`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId }),
    });
    if (res.ok) setSaved(true);
    setSaving(false);
  };

  return (
    <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-5 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">Your Package</span>
        </div>
        <p className="font-bold text-3xl text-teal-700">{travelPackage.currency} {price}</p>
        <p className="font-semibold text-lg mt-1">{travelPackage.name}</p>
        {travelPackage.description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{travelPackage.description}</p>
        )}
      </div>

      {/* Inclusions */}
      {inclusions.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">What&apos;s included</p>
          <ul className="space-y-1.5">
            {inclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Exclusions */}
      {exclusions.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Not included</p>
          <ul className="space-y-1.5">
            {exclusions.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Doctor selection */}
      {recommendedDoctors.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Choose your doctor
          </p>
          <div className="space-y-3">
            {recommendedDoctors.map((d) => {
              const isSelected = selectedId === d.id;
              return (
                <div key={d.id} className={`rounded-lg border-2 p-4 transition-all ${
                  isSelected ? "border-teal-500 bg-white" : "border-border bg-white hover:border-teal-200"
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">Dr. {d.firstName} {d.lastName}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        {d.specialization && (
                          <span className="text-xs text-muted-foreground">{d.specialization.name}</span>
                        )}
                        {d.clinic && (
                          <span className="text-xs text-muted-foreground">{d.clinic.name} · {d.clinic.city}</span>
                        )}
                        {d.yearsExperience != null && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="h-3 w-3" /> {d.yearsExperience} yrs exp.
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="flex items-center gap-1.5 text-teal-600 text-sm font-medium shrink-0">
                        <UserCheck className="h-4 w-4" /> Selected
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleSelect(d.id)} disabled={saving}>
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {saved && selectedId && (
            <p className="text-xs text-teal-600 mt-3 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Your doctor selection has been saved.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
