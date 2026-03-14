import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoctorCard } from "@/components/marketplace/DoctorCard";
import { formatPrice } from "@/lib/utils";
import {
  getProcedureBySlug,
  getDoctors,
} from "@/lib/data/marketplace";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProcedureDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const procedure = await getProcedureBySlug(slug);
  if (!procedure) notFound();

  const doctors = await getDoctors({
    specialization: procedure.specialization.slug,
  });

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-2">
          {procedure.specialization.name}
        </Badge>
        <h1 className="font-bold text-3xl">{procedure.name}</h1>
        {procedure.description && (
          <p className="mt-2 text-muted-foreground">{procedure.description}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {procedure.priceFrom != null && (
            <span className="font-semibold text-lg">
              From {formatPrice(procedure.priceFrom)}
            </span>
          )}
          {procedure.doctorCount != null && (
            <span className="text-muted-foreground">
              {procedure.doctorCount} doctor{procedure.doctorCount !== 1 ? "s" : ""}{" "}
              available
            </span>
          )}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="font-semibold text-xl mb-4">Doctors offering this procedure</h2>
        {doctors.length === 0 ? (
          <p className="text-muted-foreground">
            No doctors found for this procedure.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/register">Request a Consultation</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/procedures">Back to Procedures</Link>
        </Button>
      </div>
    </div>
  );
}
