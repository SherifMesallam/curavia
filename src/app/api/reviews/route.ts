import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createReview } from "@/lib/modules/review/service";
import { createReviewSchema } from "@/lib/modules/review/validations";

/**
 * POST /api/reviews
 * Patient submits a review for a doctor or clinic.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized. Patient login required." }, { status: 401 });
  }

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: session.id },
  });
  if (!patientProfile) {
    return NextResponse.json({ error: "Patient profile not found" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const review = await createReview(patientProfile.id, parsed.data);
    return NextResponse.json({ success: true, review });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit review";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
