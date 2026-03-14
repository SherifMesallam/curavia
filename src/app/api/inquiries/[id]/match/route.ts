import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { matchAndStoreRecommendations } from "@/lib/modules/matching";

/**
 * POST /api/inquiries/[id]/match
 * Re-runs the matching engine for an inquiry case.
 * Patient: can run for their own inquiries.
 * Admin: can run for any inquiry.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: inquiryCaseId } = await params;

  const inquiry = await prisma.inquiryCase.findUnique({
    where: { id: inquiryCaseId },
    include: { patient: true },
  });

  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const isPatient = session.role === "PATIENT" && inquiry.patient.userId === session.id;
  const isAdmin = session.role === "ADMIN";

  if (!isPatient && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const results = await matchAndStoreRecommendations({
      inquiryCaseId,
      clearExisting: true,
      recommendedById: isAdmin ? session.id : null,
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      recommendations: results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Matching failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
