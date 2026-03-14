import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAllReviewsForAdmin } from "@/lib/modules/review/service";
import { ReviewActions } from "@/components/admin/ReviewActions";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  HIDDEN: "Hidden",
  FLAGGED: "Flagged",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  HIDDEN: "outline",
  FLAGGED: "destructive",
};

export default async function AdminReviewsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const reviews = await getAllReviewsForAdmin();

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Review moderation</h1>
        <p className="text-muted-foreground mt-1">
          Approve, hide, or flag reviews. Only APPROVED reviews are visible to the public.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const rating = r.overall ?? r.rating;
            const rev = r as typeof r & {
              doctor?: { firstName: string; lastName: string } | null;
              clinic?: { name: string } | null;
              patient?: { user?: { firstName?: string; lastName?: string; email?: string } } | null;
              inquiryCase?: { procedure?: { name: string } } | null;
            };
            const target = rev.doctor
              ? `Dr. ${rev.doctor.firstName} ${rev.doctor.lastName}`
              : rev.clinic?.name ?? "—";
            return (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{target}</span>
                      <Badge variant={STATUS_VARIANTS[r.status] ?? "outline"}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                      {r.verifiedPatient && (
                        <Badge variant="secondary">Verified patient</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      By {rev.patient?.user?.firstName} {rev.patient?.user?.lastName} ({rev.patient?.user?.email})
                      {rev.inquiryCase?.procedure && ` • ${rev.inquiryCase.procedure.name}`}
                    </p>
                    {rating != null && (
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{rating}/5</span>
                        {(r.professionalism ?? r.communication ?? r.cleanliness ?? r.outcome) != null && (
                          <span className="text-muted-foreground ml-2">
                            (P: {r.professionalism ?? "—"} C: {r.communication ?? "—"} Cl: {r.cleanliness ?? "—"} O: {r.outcome ?? "—"})
                          </span>
                        )}
                      </div>
                    )}
                    {r.comment && (
                      <p className="mt-2 text-sm">{r.comment}</p>
                    )}
                  </div>
                  <ReviewActions reviewId={r.id} status={r.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
