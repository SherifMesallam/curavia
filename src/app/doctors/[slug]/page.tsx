import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { DoctorAvatar } from "@/components/shared/DoctorAvatar";
import { formatPrice, formatRating } from "@/lib/utils";
import { Star, MapPin, Calendar, CheckCircle } from "lucide-react";
import { getDoctorBySlug } from "@/lib/data/marketplace";
import { getSession } from "@/lib/auth/session";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [doctor, session] = await Promise.all([getDoctorBySlug(slug), getSession()]);
  if (!doctor) notFound();

  const isPatient = session?.role === "PATIENT";

  // Build the enquiry URL — pre-seed doctor context via query params
  const enquiryParams = new URLSearchParams();
  enquiryParams.set("doctorId", doctor.id);
  enquiryParams.set("doctorName", `Dr. ${doctor.firstName} ${doctor.lastName}`);
  if (doctor.specialization) enquiryParams.set("specializationId", doctor.specialization.id);
  if (doctor.procedures.length === 1) enquiryParams.set("procedureId", doctor.procedures[0].id);

  const enquiryHref = isPatient
    ? `/patient/inquiries/new?${enquiryParams.toString()}`
    : "/register";

  const displayName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const reviewSummary = doctor.reviewSummary;

  const avatarUrl = `/images/doctors/${doctor.slug}.jpg`;

  return (
    <div className="container py-10">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <DoctorAvatar src={avatarUrl} alt={displayName} size="lg" />
              <div>
              <h1 className="font-bold text-3xl">{displayName}</h1>
              {doctor.specialization && (
                <Badge variant="secondary" className="mt-2">
                  {doctor.specialization.name}
                </Badge>
              )}
              {doctor.isVerified && (
                <div className="mt-2">
                  <VerifiedBadge />
                </div>
              )}
              </div>
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
              {doctor.priceFrom != null && (
                <span className="font-semibold text-lg">
                  From {formatPrice(doctor.priceFrom)}
                </span>
              )}
            </div>
          </div>

          {doctor.clinic && (
            <div className="mt-6 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {doctor.clinic.name}, {doctor.clinic.city}, {doctor.clinic.country}
            </div>
          )}

          {doctor.bio && (
            <div className="mt-6">
              <h2 className="font-semibold text-lg">About</h2>
              <p className="mt-2 text-muted-foreground">{doctor.bio}</p>
            </div>
          )}

          {doctor.yearsExperience != null && (
            <p className="mt-4 text-sm text-muted-foreground">
              {doctor.yearsExperience} years of experience
            </p>
          )}

          {doctor.procedures.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold text-lg">Procedures</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {doctor.procedures.map((p) => (
                  <Badge key={p.id} variant="outline">
                    {p.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {doctor.reviews && doctor.reviews.length > 0 && (
            <div className="mt-10">
              <h2 className="font-semibold text-lg">
                Patient Reviews ({doctor.reviews.length})
              </h2>
              <div className="mt-4 space-y-4">
                {doctor.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{review.patientName}</span>
                            {review.verifiedPatient && (
                              <span className="flex items-center gap-1 text-xs text-emerald-600">
                                <CheckCircle className="h-3 w-3" />
                                Verified patient
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        {review.overall != null && (
                          <div className="flex shrink-0 items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.overall!
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {review.comment && (
                        <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                      )}

                      {(review.professionalism != null ||
                        review.communication != null ||
                        review.cleanliness != null ||
                        review.outcome != null) && (
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {review.professionalism != null && (
                            <span>Professionalism: <strong>{formatRating(review.professionalism)}</strong></span>
                          )}
                          {review.communication != null && (
                            <span>Communication: <strong>{formatRating(review.communication)}</strong></span>
                          )}
                          {review.cleanliness != null && (
                            <span>Cleanliness: <strong>{formatRating(review.cleanliness)}</strong></span>
                          )}
                          {review.outcome != null && (
                            <span>Outcome: <strong>{formatRating(review.outcome)}</strong></span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-lg border bg-card p-6">
            <h3 className="font-semibold text-lg">Request a Consultation</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get matched with this doctor and schedule a consultation.
            </p>
            <Button className="mt-6 w-full" size="lg" asChild>
              <Link href={enquiryHref}>
                <Calendar className="mr-2 h-4 w-4" />
                {isPatient ? "Send Enquiry" : "Get Started"}
              </Link>
            </Button>
            {isPatient && (
              <Button variant="outline" className="mt-3 w-full" size="lg" asChild>
                <Link href={`/patient/consultations/new?doctorId=${doctor.id}`}>
                  Book a Consultation
                </Link>
              </Button>
            )}
            <Button variant="outline" className="mt-3 w-full" asChild>
              <Link href="/doctors">Browse other doctors</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
