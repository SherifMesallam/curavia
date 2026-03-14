import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { confirmConsultation } from "@/lib/modules/consultation/service";

/**
 * POST /api/consultations/[id]/confirm
 * Patient confirms the proposed consultation time.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  try {
    const consultation = await confirmConsultation(id, patientProfile.id);
    return NextResponse.json({ success: true, consultation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to confirm consultation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
