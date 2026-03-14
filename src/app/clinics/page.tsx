import { Suspense } from "react";
import { ClinicCard } from "@/components/marketplace/ClinicCard";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import {
  getSpecializations,
  getClinics,
  getCities,
} from "@/lib/data/marketplace";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ClinicsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const city =
    typeof params.city === "string" ? params.city : undefined;
  const priceMin =
    typeof params.priceMin === "string" && params.priceMin
      ? parseInt(params.priceMin, 10)
      : undefined;
  const priceMax =
    typeof params.priceMax === "string" && params.priceMax
      ? parseInt(params.priceMax, 10)
      : undefined;

  const [specializations, clinics, cities] = await Promise.all([
    getSpecializations(),
    getClinics({ city, priceMin, priceMax }),
    getCities(),
  ]);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Clinics</h1>
        <p className="mt-2 text-muted-foreground">
          Browse vetted dental and LASIK clinics in Egypt.
        </p>
      </div>

      <Suspense fallback={null}>
        <MarketplaceFilters
          specializations={specializations}
          cities={cities}
          showSpecialization={false}
          showCity
          showPrice
        />
      </Suspense>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clinics.length === 0 ? (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            No clinics match your filters.
          </p>
        ) : (
          clinics.map((c) => <ClinicCard key={c.id} clinic={c} />)
        )}
      </div>
    </div>
  );
}
