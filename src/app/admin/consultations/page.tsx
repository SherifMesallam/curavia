import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAdminConsultations } from "@/lib/modules/consultation/service";
import { Badge } from "@/components/ui/badge";
import { AdminConsultationActions } from "@/components/admin/AdminConsultationActions";
import { Calendar, Clock, Video } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  PENDING_CONFIRMATION: "Awaiting patient confirmation",
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

export default async function AdminConsultationsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const consultations = await getAdminConsultations();

  const pending = consultations.filter((c) => c.status === "REQUESTED");
  const active = consultations.filter((c) => ["PENDING_CONFIRMATION", "CONFIRMED"].includes(c.status));
  const done = consultations.filter((c) => ["COMPLETED", "CANCELLED"].includes(c.status));

  const Section = ({ title, items }: { title: string; items: typeof consultations }) =>
    items.length === 0 ? null : (
      <div>
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">{title}</h2>
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">
                      {c.patient.user.firstName} {c.patient.user.lastName}
                    </span>
                    <span className="text-muted-foreground text-sm">→</span>
                    <span className="font-medium">
                      Dr. {c.doctor.firstName} {c.doctor.lastName}
                    </span>
                    <Badge variant={STATUS_VARIANTS[c.status] ?? "outline"}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                    <span>{c.patient.user.email}</span>
                    {c.doctor.specialization && <span>· {c.doctor.specialization.name}</span>}
                    {c.doctor.clinic && <span>· {c.doctor.clinic.name}</span>}
                    {c.inquiryCase?.procedure && (
                      <span className="text-teal-600">· re: {c.inquiryCase.procedure.name}</span>
                    )}
                  </div>
                  {c.notes && (
                    <p className="mt-2 text-sm text-muted-foreground italic">&ldquo;{c.notes}&rdquo;</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    {c.proposedAt && (
                      <div className="flex items-center gap-1.5 text-amber-600">
                        <Clock className="h-3.5 w-3.5" />
                        Proposed: {new Date(c.proposedAt).toLocaleString()}
                      </div>
                    )}
                    {c.scheduledAt && (
                      <div className="flex items-center gap-1.5 text-teal-600 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        Scheduled: {new Date(c.scheduledAt).toLocaleString()}
                      </div>
                    )}
                    <span className="text-muted-foreground text-xs">
                      Requested {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <AdminConsultationActions consultationId={c.id} status={c.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Consultations</h1>
        <p className="text-muted-foreground mt-1">
          Standalone patient–doctor consultations — {consultations.length} total
        </p>
      </div>

      {consultations.length === 0 ? (
        <div className="rounded-lg border p-16 text-center">
          <Video className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No consultations yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          <Section title={`Action required (${pending.length})`} items={pending} />
          <Section title={`In progress (${active.length})`} items={active} />
          <Section title={`Completed / Cancelled (${done.length})`} items={done} />
        </div>
      )}
    </div>
  );
}
