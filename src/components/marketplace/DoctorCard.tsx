"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { DoctorAvatar } from "@/components/shared/DoctorAvatar";
import { formatPrice, formatRating } from "@/lib/utils";
import { Star } from "lucide-react";
import type { Doctor } from "@/types/marketplace";

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const displayName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const reviewSummary = doctor.reviewSummary;
  const avatarUrl = doctor.avatarUrl ?? `/images/doctors/${doctor.slug}.jpg`;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex-1 p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <DoctorAvatar src={avatarUrl} alt={displayName} size="sm" />
            <div>
            <h3 className="font-semibold text-lg">{displayName}</h3>
            {doctor.specialization && (
              <p className="text-sm text-muted-foreground">
                {doctor.specialization.name}
              </p>
            )}
            </div>
          </div>
          {doctor.isVerified && <VerifiedBadge />}
        </div>

        {doctor.clinic && (
          <p className="mb-2 text-sm text-muted-foreground">
            {doctor.clinic.name}, {doctor.clinic.city}
          </p>
        )}

        {doctor.bio && (
          <p className="mb-4 line-clamp-2 text-sm">{doctor.bio}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {reviewSummary && (
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {formatRating(reviewSummary.averageRating)} ({reviewSummary.totalReviews})
            </span>
          )}
          {doctor.yearsExperience != null && (
            <span className="text-muted-foreground">
              {doctor.yearsExperience} yrs exp.
            </span>
          )}
          {doctor.priceFrom != null && (
            <span className="font-medium">
              From {formatPrice(doctor.priceFrom)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button asChild className="w-full">
          <Link href={`/doctors/${doctor.slug}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
