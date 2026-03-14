import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { bookConsultation } from "@/lib/modules/consultation/service";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { doctorId, notes, inquiryCaseId } = await req.json();
  if (!doctorId) return NextResponse.json({ error: "doctorId is required" }, { status: 400 });

  try {
    const consultation = await bookConsultation(profile.id, doctorId, notes, inquiryCaseId);
    return NextResponse.json({ consultation });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
