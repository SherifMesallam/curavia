import { Suspense } from "react";
import { DoctorCard } from "@/components/marketplace/DoctorCard";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import {
  getSpecializations,
  getDoctors,
  getCities,
} from "@/lib/data/marketplace";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DoctorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const specialization =
    typeof params.specialization === "string" ? params.specialization : undefined;
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

  const [specializations, doctors, cities] = await Promise.all([
    getSpecializations(),
    getDoctors({ specialization, city, priceMin, priceMax }),
    getCities(),
  ]);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Doctors</h1>
        <p className="mt-2 text-muted-foreground">
          Browse vetted dental and LASIK specialists in Egypt.
        </p>
      </div>

      <Suspense fallback={null}>
        <MarketplaceFilters
          specializations={specializations}
          cities={cities}
          showSpecialization
          showCity
          showPrice
        />
      </Suspense>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.length === 0 ? (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            No doctors match your filters.
          </p>
        ) : (
          doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)
        )}
      </div>
    </div>
  );
}
