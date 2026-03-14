import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { doctorId } = await req.json();

  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const inquiry = await prisma.inquiryCase.findFirst({ where: { id, patientId: profile.id } });
  if (!inquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

  const updated = await prisma.inquiryCase.update({
    where: { id },
    data: { selectedDoctorId: doctorId },
  });

  return NextResponse.json({ success: true, selectedDoctorId: updated.selectedDoctorId });
}
