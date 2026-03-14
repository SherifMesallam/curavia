import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { formatPrice, formatRating } from "@/lib/utils";
import { Star, MapPin } from "lucide-react";
import type { Clinic } from "@/types/marketplace";

interface ClinicCardProps {
  clinic: Clinic;
}

export function ClinicCard({ clinic }: ClinicCardProps) {
  const reviewSummary = clinic.reviewSummary;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex-1 p-6">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg">{clinic.name}</h3>
          {clinic.isVerified && <VerifiedBadge />}
        </div>

        <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          {clinic.city}, {clinic.country}
        </div>

        {clinic.description && (
          <p className="mb-4 line-clamp-2 text-sm">{clinic.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {reviewSummary && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {formatRating(reviewSummary.averageRating)} ({reviewSummary.totalReviews})
            </span>
          )}
          {clinic.doctorCount != null && (
            <span className="text-muted-foreground">
              {clinic.doctorCount} doctor{clinic.doctorCount !== 1 ? "s" : ""}
            </span>
          )}
          {clinic.priceFrom != null && (
            <span className="font-medium">
              From {formatPrice(clinic.priceFrom)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button asChild className="w-full">
          <Link href={`/clinics/${clinic.slug}`}>View Clinic</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
