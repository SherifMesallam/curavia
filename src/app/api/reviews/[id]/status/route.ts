import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateReviewStatus } from "@/lib/modules/review/service";

const ALLOWED_STATUSES = ["APPROVED", "REJECTED", "HIDDEN", "FLAGGED"] as const;

/**
 * PATCH /api/reviews/[id]/status
 * Admin updates review status (approve, hide, flag, reject).
 * Body: { status: "APPROVED" | "REJECTED" | "HIDDEN" | "FLAGGED" }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin required." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const status = body.status;
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const review = await updateReviewStatus(id, status, session.id);
    return NextResponse.json({ success: true, review });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update review";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
