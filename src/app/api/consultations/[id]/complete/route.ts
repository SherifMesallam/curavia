import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { completeConsultation } from "@/lib/modules/consultation/service";

/**
 * POST /api/consultations/[id]/complete
 * Provider marks consultation as completed.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized. Provider login required." }, { status: 401 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { userId: session.id },
  });
  if (!provider) {
    return NextResponse.json({ error: "Provider profile not found" }, { status: 400 });
  }

  const { id } = await params;

  const cr = await prisma.consultationRequest.findFirst({
    where: { id },
    include: { doctor: true },
  });
  if (!cr || cr.doctor.providerId !== provider.id) {
    return NextResponse.json({ error: "Not authorized to manage this consultation" }, { status: 403 });
  }

  try {
    const consultation = await completeConsultation(id, cr.doctorId);
    return NextResponse.json({ success: true, consultation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to complete consultation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
