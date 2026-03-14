import { Suspense } from "react";
import { ProcedureCard } from "@/components/marketplace/ProcedureCard";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import {
  getSpecializations,
  getProcedures,
  getCities,
} from "@/lib/data/marketplace";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProceduresPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const specialization =
    typeof params.specialization === "string" ? params.specialization : undefined;
  const priceMin =
    typeof params.priceMin === "string" && params.priceMin
      ? parseInt(params.priceMin, 10)
      : undefined;
  const priceMax =
    typeof params.priceMax === "string" && params.priceMax
      ? parseInt(params.priceMax, 10)
      : undefined;

  const [specializations, procedures, cities] = await Promise.all([
    getSpecializations(),
    getProcedures({ specialization, priceMin, priceMax }),
    getCities(),
  ]);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Procedures</h1>
        <p className="mt-2 text-muted-foreground">
          Browse dental and LASIK procedures. Compare prices and find the right
          specialist.
        </p>
      </div>

      <Suspense fallback={null}>
        <MarketplaceFilters
          specializations={specializations}
          cities={cities}
          showSpecialization
          showCity={false}
          showPrice
        />
      </Suspense>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {procedures.length === 0 ? (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            No procedures match your filters.
          </p>
        ) : (
          procedures.map((p) => <ProcedureCard key={p.id} procedure={p} />)
        )}
      </div>
    </div>
  );
}
