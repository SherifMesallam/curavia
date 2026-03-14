import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { DoctorCard } from "@/components/marketplace/DoctorCard";
import { formatPrice, formatRating } from "@/lib/utils";
import { MapPin, Calendar } from "lucide-react";
import { Star } from "lucide-react";
import { getClinicBySlug, getDoctors } from "@/lib/data/marketplace";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClinicDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const clinic = await getClinicBySlug(slug);
  if (!clinic) notFound();

  const doctors = await getDoctors({});
  const clinicDoctors = doctors.filter((d) => d.clinic?.id === clinic.id);
  const reviewSummary = clinic.reviewSummary;

  return (
    <div className="container py-10">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-bold text-3xl">{clinic.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {clinic.city}, {clinic.country}
              </div>
              {clinic.isVerified && (
                <div className="mt-2">
                  <VerifiedBadge />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {reviewSummary && (
                <div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-medium">
                      {formatRating(reviewSummary.averageRating)}
                    </span>
                    <span className="text-muted-foreground">
                      ({reviewSummary.totalReviews} reviews)
                    </span>
                  </div>
                  {(reviewSummary.professionalism ?? reviewSummary.communication ?? reviewSummary.cleanliness ?? reviewSummary.outcome) != null && (
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0 text-xs text-muted-foreground">
                      {reviewSummary.professionalism != null && <span>Professionalism: {formatRating(reviewSummary.professionalism)}</span>}
                      {reviewSummary.communication != null && <span>Communication: {formatRating(reviewSummary.communication)}</span>}
                      {reviewSummary.cleanliness != null && <span>Cleanliness: {formatRating(reviewSummary.cleanliness)}</span>}
                      {reviewSummary.outcome != null && <span>Outcome: {formatRating(reviewSummary.outcome)}</span>}
                    </div>
                  )}
                </div>
              )}
              {clinic.priceFrom != null && (
                <span className="font-semibold text-lg">
                  From {formatPrice(clinic.priceFrom)}
                </span>
              )}
            </div>
          </div>

          {clinic.description && (
            <div className="mt-6">
              <h2 className="font-semibold text-lg">About</h2>
              <p className="mt-2 text-muted-foreground">{clinic.description}</p>
            </div>
          )}

          {clinic.doctorCount != null && (
            <p className="mt-4 text-sm text-muted-foreground">
              {clinic.doctorCount} doctor{clinic.doctorCount !== 1 ? "s" : ""} at this clinic
            </p>
          )}

          {clinicDoctors.length > 0 && (
            <div className="mt-10">
              <h2 className="font-semibold text-xl mb-4">Doctors at this clinic</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {clinicDoctors.map((d) => (
                  <DoctorCard key={d.id} doctor={d} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-lg border bg-card p-6">
            <h3 className="font-semibold text-lg">Request a Consultation</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get matched with a doctor at this clinic.
            </p>
            <Button className="mt-6 w-full" size="lg" asChild>
              <Link href="/register">
                <Calendar className="mr-2 h-4 w-4" />
                Request Consultation
              </Link>
            </Button>
            <Button variant="outline" className="mt-3 w-full" asChild>
              <Link href="/clinics">Browse other clinics</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
