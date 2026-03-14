import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { cancelConsultation } from "@/lib/modules/consultation/service";

/**
 * POST /api/consultations/[id]/cancel
 * Patient, provider, or admin cancels a consultation.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await cancelConsultation(id, session.id, session.role ?? "");
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to cancel consultation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
