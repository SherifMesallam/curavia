"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Package, Trash2, UserCheck } from "lucide-react";

type TravelPackage = {
  id: string;
  name: string;
  price: number | { toNumber: () => number } | string;
  currency: string;
  description: string | null;
  inclusions: string | null;
  exclusions: string | null;
  recommendedDoctors: string | null;
  status: string;
};

type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
  specialization: { name: string } | null;
  clinic: { name: string; city: string } | null;
};

function parseList(json: string | null): string[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

function priceNum(price: TravelPackage["price"]): number {
  if (typeof price === "object" && "toNumber" in price) return price.toNumber();
  return Number(price);
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-teal-100 text-teal-800",
  ARCHIVED: "bg-amber-100 text-amber-800",
};

export function PackageBuilder({
  enquiryId,
  existing,
  specializationId,
  preselectedDoctorId,
}: {
  enquiryId: string;
  existing: TravelPackage | null;
  specializationId?: string | null;
  preselectedDoctorId?: string | null;
}) {
  const [pkg, setPkg] = useState<TravelPackage | null>(existing);
  const [editing, setEditing] = useState(!existing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Doctors
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [recommendedIds, setRecommendedIds] = useState<string[]>(
    parseList(existing?.recommendedDoctors ?? null)
  );

  useEffect(() => {
    const qs = specializationId ? `?specializationId=${specializationId}` : "";
    fetch(`/api/admin/doctors${qs}`)
      .then((r) => r.json())
      .then(({ doctors }) => setAllDoctors(doctors ?? []));
  }, [specializationId]);

  // Form state
  const [name, setName] = useState(existing?.name ?? "");
  const [price, setPrice] = useState(existing ? String(priceNum(existing.price)) : "");
  const [currency, setCurrency] = useState(existing?.currency ?? "USD");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [inclusions, setInclusions] = useState<string[]>(parseList(existing?.inclusions ?? null));
  const [exclusions, setExclusions] = useState<string[]>(parseList(existing?.exclusions ?? null));
  const [incInput, setIncInput] = useState("");
  const [excInput, setExcInput] = useState("");
  const [status, setStatus] = useState(existing?.status ?? "DRAFT");

  const addItem = (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
    const val = input.trim();
    if (val && !list.includes(val)) setList([...list, val]);
    setInput("");
  };
  const removeItem = (list: string[], setList: (v: string[]) => void, idx: number) =>
    setList(list.filter((_, i) => i !== idx));

  const toggleDoctor = (id: string) =>
    setRecommendedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSave = async (publishStatus?: string) => {
    setSaving(true);
    const finalStatus = publishStatus ?? status;
    const method = pkg ? "PATCH" : "POST";
    const res = await fetch(`/api/admin/enquiries/${enquiryId}/package`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, price: parseFloat(price), currency, description,
        inclusions, exclusions, recommendedDoctors: recommendedIds, status: finalStatus,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setPkg(data.package);
      setStatus(data.package.status);
      setEditing(false);
    } else {
      alert(data.error ?? "Save failed");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this package?")) return;
    setDeleting(true);
    await fetch(`/api/admin/enquiries/${enquiryId}/package`, { method: "DELETE" });
    setPkg(null);
    setEditing(true);
    setName(""); setPrice(""); setDescription("");
    setInclusions([]); setExclusions([]); setRecommendedIds([]); setStatus("DRAFT");
    setDeleting(false);
  };

  const viewDoctors = allDoctors.filter((d) => parseList(pkg?.recommendedDoctors ?? null).includes(d.id));

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-teal-600" />
          <h2 className="font-semibold text-lg">Travel Package</h2>
        </div>
        {pkg && !editing && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[pkg.status] ?? ""}`}>
            {pkg.status}
          </span>
        )}
      </div>

      {/* ── View mode ── */}
      {pkg && !editing ? (
        <div className="space-y-5">
          <div>
            <p className="font-semibold text-xl">{pkg.name}</p>
            <p className="text-2xl font-bold text-teal-700 mt-1">
              {pkg.currency} {priceNum(pkg.price).toLocaleString()}
            </p>
          </div>
          {pkg.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>
          )}
          {parseList(pkg.inclusions).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Inclusions</p>
              <ul className="space-y-1">
                {parseList(pkg.inclusions).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-teal-600 mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {parseList(pkg.exclusions).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Exclusions</p>
              <ul className="space-y-1">
                {parseList(pkg.exclusions).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {viewDoctors.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recommended Doctors</p>
              <ul className="space-y-2">
                {viewDoctors.map((d) => (
                  <li key={d.id} className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>Dr. {d.firstName} {d.lastName}</span>
                    {d.clinic && <span className="text-muted-foreground">· {d.clinic.name}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => setEditing(true)} variant="outline" size="sm">Edit</Button>
            <Button onClick={handleDelete} variant="ghost" size="sm" disabled={deleting}
              className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
      ) : (
        /* ── Edit / create mode ── */
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Package name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium LASIK Package" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Price *</Label>
              <Input type="number" min={0} value={price}
                onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <Label>Currency</Label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="EGP">EGP</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} placeholder="What's included in this package..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {/* Inclusions */}
          <div className="space-y-2">
            <Label>Inclusions</Label>
            <div className="flex gap-2">
              <Input value={incInput} onChange={(e) => setIncInput(e.target.value)}
                placeholder="e.g. Airport transfer"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(inclusions, setInclusions, incInput, setIncInput))} />
              <Button type="button" size="icon" variant="outline"
                onClick={() => addItem(inclusions, setInclusions, incInput, setIncInput)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {inclusions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {inclusions.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs text-teal-800">
                    {item}
                    <button onClick={() => removeItem(inclusions, setInclusions, i)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Exclusions */}
          <div className="space-y-2">
            <Label>Exclusions</Label>
            <div className="flex gap-2">
              <Input value={excInput} onChange={(e) => setExcInput(e.target.value)}
                placeholder="e.g. Flights"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(exclusions, setExclusions, excInput, setExcInput))} />
              <Button type="button" size="icon" variant="outline"
                onClick={() => addItem(exclusions, setExclusions, excInput, setExcInput)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {exclusions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exclusions.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted border px-2.5 py-1 text-xs text-muted-foreground">
                    {item}
                    <button onClick={() => removeItem(exclusions, setExclusions, i)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Doctor recommendations */}
          <div className="space-y-2">
            <Label>
              Recommend doctors
              {preselectedDoctorId && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">(patient already chose a doctor)</span>
              )}
            </Label>
            {allDoctors.length === 0 ? (
              <p className="text-xs text-muted-foreground">No approved doctors found.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-md border p-2">
                {allDoctors.map((d) => {
                  const selected = recommendedIds.includes(d.id);
                  return (
                    <button key={d.id} type="button" onClick={() => toggleDoctor(d.id)}
                      className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selected ? "bg-teal-50 border border-teal-200" : "hover:bg-muted/50 border border-transparent"
                      }`}>
                      <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${selected ? "bg-teal-600 border-teal-600" : "border-input"}`}>
                        {selected && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <div>
                        <span className="font-medium">Dr. {d.firstName} {d.lastName}</span>
                        {d.specialization && <span className="text-muted-foreground ml-1">· {d.specialization.name}</span>}
                        {d.clinic && <span className="text-muted-foreground ml-1">· {d.clinic.name}, {d.clinic.city}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {recommendedIds.length > 0 && (
              <p className="text-xs text-muted-foreground">{recommendedIds.length} doctor{recommendedIds.length > 1 ? "s" : ""} selected</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => handleSave("DRAFT")} variant="outline" disabled={saving || !name || !price}>
              {saving ? "Saving…" : "Save as Draft"}
            </Button>
            <Button onClick={() => handleSave("PUBLISHED")} disabled={saving || !name || !price}
              className="flex-1 bg-teal-600 hover:bg-teal-700">
              {saving ? "Publishing…" : "Publish to Patient"}
            </Button>
            {pkg && (
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
