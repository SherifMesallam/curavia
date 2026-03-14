import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createConsultationRequest } from "@/lib/modules/consultation/service";

/**
 * POST /api/consultations/request
 * Patient submits a consultation request for a recommended doctor.
 * Body: { inquiryCaseId, doctorId, patientNotes? }
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
    const { inquiryCaseId, doctorId, patientNotes } = body;

    if (!inquiryCaseId || !doctorId) {
      return NextResponse.json(
        { error: "inquiryCaseId and doctorId are required" },
        { status: 400 }
      );
    }

    const consultation = await createConsultationRequest(
      inquiryCaseId,
      doctorId,
      patientProfile.id,
      patientNotes
    );

    return NextResponse.json({ success: true, consultation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create consultation request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
