import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getInquiryById } from "@/lib/modules/inquiry/service";
import { prisma } from "@/lib/db";
import { PackageView } from "@/components/patient/PackageView";
import { InquiryChat } from "@/components/shared/InquiryChat";
import Link from "next/link";
import { AddInquiryFiles } from "@/components/patient/AddInquiryFiles";
import { CancelConsultationButton } from "@/components/shared/CancelConsultationButton";
import { SubmitReviewForm } from "@/components/patient/SubmitReviewForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const INQUIRY_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  MATCHED: "Matched",
  CONSULTATION_REQUESTED: "Consultation requested",
  PACKAGE_PREPARED: "Package prepared",
  CLOSED: "Closed",
};

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    notFound();
  }

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
  });
  if (!patientProfile) notFound();

  const { id } = await params;
  const [inquiry, travelPackage] = await Promise.all([
    getInquiryById(id, patientProfile.id),
    prisma.travelPackage.findFirst({
      where: { inquiryCaseId: id, status: "PUBLISHED" },
    }),
  ]);
  if (!inquiry) notFound();

  function parseList(json: string | null): string[] {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  }

  // Fetch recommended doctors for this package
  const recommendedDoctorIds = parseList(travelPackage?.recommendedDoctors ?? null);
  const recommendedDoctors = recommendedDoctorIds.length > 0
    ? await prisma.doctor.findMany({
        where: { id: { in: recommendedDoctorIds }, status: "APPROVED" },
        include: { specialization: true, clinic: true },
      })
    : [];

  const selectedDoctorId = await prisma.inquiryCase
    .findUnique({ where: { id }, select: { selectedDoctorId: true, preferredDoctorId: true } })
    .then((c) => ({ selected: c?.selectedDoctorId ?? null, preferred: c?.preferredDoctorId ?? null }));

  return (
    <div className="container max-w-2xl py-10">
      <Button variant="ghost" asChild>
        <Link href="/patient/dashboard">← Back to cases</Link>
      </Button>

      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl">
              {inquiry.procedure?.name ?? inquiry.specialization?.name ?? "Medical inquiry"}
            </h1>
            <Badge variant="outline" className="mt-2">
              {INQUIRY_STATUS_LABELS[inquiry.status] ?? inquiry.status}
            </Badge>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-3">Case details</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Procedure</dt>
              <dd>{inquiry.procedure?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Country</dt>
              <dd>{inquiry.patientCountry ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Age</dt>
              <dd>{inquiry.age ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Budget</dt>
              <dd>
                {inquiry.budgetMin != null && inquiry.budgetMax != null
                  ? `$${inquiry.budgetMin} - $${inquiry.budgetMax}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Preferred travel</dt>
              <dd>
                {inquiry.travelDateStart && inquiry.travelDateEnd
                  ? `${new Date(inquiry.travelDateStart).toLocaleDateString()} - ${new Date(inquiry.travelDateEnd).toLocaleDateString()}`
                  : "—"}
              </dd>
            </div>
            {inquiry.caseDescription && (
              <div>
                <dt className="text-muted-foreground">Description</dt>
                <dd className="whitespace-pre-wrap">{inquiry.caseDescription}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Medical files</h2>
          {inquiry.medicalFiles.length > 0 ? (
            <ul className="space-y-1 text-sm mb-4">
              {inquiry.medicalFiles.map((f) => (
                <li key={f.id}>{f.fileName}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">No files uploaded yet.</p>
          )}
          <AddInquiryFiles inquiryCaseId={inquiry.id} />
        </div>

        {/* Travel package — shown when admin publishes one */}
        {travelPackage && (
          <PackageView
            travelPackage={travelPackage}
            recommendedDoctors={recommendedDoctors}
            inquiryId={id}
            initialSelectedDoctorId={selectedDoctorId.selected}
            preselectedDoctorId={selectedDoctorId.preferred}
          />
        )}

        {/* Chat */}
        <InquiryChat inquiryId={id} currentUserIsAdmin={false} />

        {inquiry.consultationRequests.length > 0 && (
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold mb-2">Consultation requests</h2>
            <ul className="space-y-3 text-sm">
              {inquiry.consultationRequests.map((cr) => (
                <li key={cr.id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <span>
                      Dr. {cr.doctor.firstName} {cr.doctor.lastName} • {cr.doctor.clinic?.name ?? "Solo"}
                    </span>
                    <Badge variant="outline">{cr.status.replace(/_/g, " ")}</Badge>
                  </div>
                  {cr.proposedAt && (
                    <p className="mt-1 text-muted-foreground">
                      Proposed: {new Date(cr.proposedAt).toLocaleString()}
                    </p>
                  )}
                  {cr.scheduledAt && (
                    <p className="mt-1 text-muted-foreground">
                      Scheduled: {new Date(cr.scheduledAt).toLocaleString()}
                    </p>
                  )}
                  {cr.patientNotes && (
                    <p className="mt-1 text-muted-foreground">Note: {cr.patientNotes}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {inquiry.consultationRequests.some((cr) => cr.status === "COMPLETED") && (
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold mb-3">Leave a review</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Had a completed consultation? Share your experience to help others.
            </p>
            {inquiry.consultationRequests
              .filter((cr) => cr.status === "COMPLETED")
              .map((cr) => (
                <div key={cr.id} className="mb-6 last:mb-0">
                  <h3 className="font-medium mb-2">
                    Review Dr. {cr.doctor.firstName} {cr.doctor.lastName}
                    {cr.doctor.clinic && ` (${cr.doctor.clinic.name})`}
                  </h3>
                  <SubmitReviewForm
                    doctorId={cr.doctorId}
                    inquiryCaseId={inquiry.id}
                    doctorName={`Dr. ${cr.doctor.firstName} ${cr.doctor.lastName}`}
                  />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
