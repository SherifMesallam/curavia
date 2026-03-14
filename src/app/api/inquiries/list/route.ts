import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { getPatientInquiries } from "@/lib/modules/inquiry/service";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: session.id },
    });
    if (!patientProfile) {
      return NextResponse.json({ inquiries: [] });
    }
    const inquiries = await getPatientInquiries(patientProfile.id);
    return NextResponse.json({ inquiries });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
