import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProviderConsultations } from "@/lib/modules/consultation/service";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProposeTimeForm } from "@/components/provider/ProposeTimeForm";
import { CompleteConsultationButton } from "@/components/provider/CompleteConsultationButton";
import { CancelConsultationButton } from "@/components/shared/CancelConsultationButton";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  PENDING_CONFIRMATION: "Awaiting patient confirmation",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function ProviderConsultationsPage() {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER") {
    redirect("/login");
  }

  const consultations = await getProviderConsultations(session.id);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Consultation requests</h1>
        <p className="text-muted-foreground mt-1">
          Manage consultation requests from patients. Propose a time for REQUESTED consultations.
        </p>
      </div>

      {consultations.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">
            No consultation requests yet. Patients will request consultations from your recommended profile.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((cr) => (
            <div
              key={cr.id}
              className="rounded-lg border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {cr.patient.user.firstName} {cr.patient.user.lastName}
                    </p>
                    <Badge variant="outline">
                      {STATUS_LABELS[cr.status] ?? cr.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {cr.inquiryCase?.procedure?.name ?? cr.inquiryCase?.specialization?.name ?? "Medical inquiry"}
                    {" • "}
                    {cr.patient.user.email}
                  </p>
                  {cr.patientNotes && (
                    <p className="text-sm mt-2 italic">&quot;{cr.patientNotes}&quot;</p>
                  )}
                  {cr.proposedAt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Proposed: {new Date(cr.proposedAt).toLocaleString()}
                    </p>
                  )}
                  {cr.scheduledAt && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Scheduled: {new Date(cr.scheduledAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {cr.status === "REQUESTED" && (
                    <ProposeTimeForm consultationRequestId={cr.id} />
                  )}
                  {cr.status === "CONFIRMED" && (
                    <CompleteConsultationButton consultationRequestId={cr.id} />
                  )}
                  {!["COMPLETED", "CANCELLED"].includes(cr.status) && (
                    <CancelConsultationButton consultationRequestId={cr.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
