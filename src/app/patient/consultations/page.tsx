import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getPatientConsultations } from "@/lib/modules/consultation/service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsultationActions } from "@/components/patient/ConsultationActions";
import { Calendar, Clock, Video } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  PENDING_CONFIRMATION: "Time proposed — confirm?",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  REQUESTED: "secondary",
  PENDING_CONFIRMATION: "default",
  CONFIRMED: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};

export default async function PatientConsultationsPage() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") redirect("/login");

  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.id } });
  if (!profile) redirect("/login");

  const consultations = await getPatientConsultations(profile.id);

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-bold text-2xl">My consultations</h1>
          <p className="text-muted-foreground mt-1">
            One-on-one sessions with doctors — separate from your enquiries.
          </p>
        </div>
        <Button asChild>
          <Link href="/patient/consultations/new">+ Book a consultation</Link>
        </Button>
      </div>

      {consultations.length === 0 ? (
        <div className="rounded-lg border p-16 text-center">
          <Video className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground mb-4">No consultations booked yet.</p>
          <Button asChild>
            <Link href="/patient/consultations/new">Book your first consultation</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => (
            <div key={c.id} className="rounded-lg border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">
                      Dr. {c.doctor.firstName} {c.doctor.lastName}
                    </p>
                    <Badge variant={STATUS_VARIANTS[c.status] ?? "outline"}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                    {c.doctor.specialization && <span>{c.doctor.specialization.name}</span>}
                    {c.doctor.clinic && <span>{c.doctor.clinic.name} · {c.doctor.clinic.city}</span>}
                    {c.inquiryCase?.procedure && (
                      <span className="text-teal-600">· re: {c.inquiryCase.procedure.name}</span>
                    )}
                  </div>

                  {c.notes && (
                    <p className="mt-2 text-sm text-muted-foreground italic">&ldquo;{c.notes}&rdquo;</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {c.proposedAt && c.status === "PENDING_CONFIRMATION" && (
                      <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                        <Clock className="h-4 w-4" />
                        Proposed: {new Date(c.proposedAt).toLocaleString()}
                      </div>
                    )}
                    {c.scheduledAt && (
                      <div className="flex items-center gap-1.5 text-teal-600 font-medium">
                        <Calendar className="h-4 w-4" />
                        Scheduled: {new Date(c.scheduledAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <ConsultationActions
                  consultationId={c.id}
                  status={c.status}
                  proposedAt={c.proposedAt?.toISOString() ?? null}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
