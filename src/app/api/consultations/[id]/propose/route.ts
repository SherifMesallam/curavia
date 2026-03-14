import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { proposeTime } from "@/lib/modules/consultation/service";

/**
 * POST /api/consultations/[id]/propose
 * Provider proposes a consultation time.
 * Body: { proposedAt: ISO date string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized. Provider login required." }, { status: 401 });
  }

  const { id } = await params;

  const cr = await prisma.consultationRequest.findFirst({
    where: { id },
    include: { doctor: true },
  });
  if (!cr) {
    return NextResponse.json({ error: "Consultation request not found" }, { status: 404 });
  }

  const provider = await prisma.providerProfile.findFirst({
    where: { userId: session.id },
  });
  if (!provider || cr.doctor.providerId !== provider.id) {
    return NextResponse.json({ error: "Not authorized to manage this consultation" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const proposedAt = body.proposedAt;
    if (!proposedAt) {
      return NextResponse.json({ error: "proposedAt is required (ISO date string)" }, { status: 400 });
    }

    const consultation = await proposeTime(cr.id, new Date(proposedAt), cr.doctorId);
    return NextResponse.json({ success: true, consultation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to propose time";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
