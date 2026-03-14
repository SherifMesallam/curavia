"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface MarketplaceFiltersProps {
  specializations: { id: string; name: string; slug: string }[];
  cities: string[];
  showSpecialization?: boolean;
  showCity?: boolean;
  showPrice?: boolean;
}

export function MarketplaceFilters({
  specializations,
  cities,
  showSpecialization = true,
  showCity = true,
  showPrice = true,
}: MarketplaceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push(window.location.pathname);
  }, [router]);

  const hasFilters =
    searchParams.get("specialization") ||
    searchParams.get("city") ||
    searchParams.get("priceMin") ||
    searchParams.get("priceMax");

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
      {showSpecialization && (
        <div className="min-w-[180px] space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Select
            id="specialization"
            value={searchParams.get("specialization") ?? ""}
            onChange={(e) =>
              updateFilters({
                specialization: e.target.value || undefined,
              })
            }
          >
            <option value="">All</option>
            {specializations.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      )}
      {showCity && (
        <div className="min-w-[180px] space-y-2">
          <Label htmlFor="city">City</Label>
          <Select
            id="city"
            value={searchParams.get("city") ?? ""}
            onChange={(e) =>
              updateFilters({ city: e.target.value || undefined })
            }
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      )}
      {showPrice && (
        <>
          <div className="min-w-[120px] space-y-2">
            <Label htmlFor="priceMin">Min price (USD)</Label>
            <Input
              id="priceMin"
              type="number"
              placeholder="Min"
              min={0}
              value={searchParams.get("priceMin") ?? ""}
              onChange={(e) =>
                updateFilters({
                  priceMin: e.target.value ? e.target.value : undefined,
                })
              }
            />
          </div>
          <div className="min-w-[120px] space-y-2">
            <Label htmlFor="priceMax">Max price (USD)</Label>
            <Input
              id="priceMax"
              type="number"
              placeholder="Max"
              min={0}
              value={searchParams.get("priceMax") ?? ""}
              onChange={(e) =>
                updateFilters({
                  priceMax: e.target.value ? e.target.value : undefined,
                })
              }
            />
          </div>
        </>
      )}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
