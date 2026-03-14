import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createInquiry } from "@/lib/modules/inquiry/service";
import { matchAndStoreRecommendations } from "@/lib/modules/matching";
import { inquiryFormSchema } from "@/lib/modules/inquiry/validations";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized. Patient login required." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = inquiryFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: session.id },
    });
    if (!patientProfile) {
      return NextResponse.json({ error: "Patient profile not found" }, { status: 400 });
    }
    const inquiry = await createInquiry(
      patientProfile.id,
      session.id,
      parsed.data
    );
    // Run rule-based matching and store recommendations
    await matchAndStoreRecommendations({
      inquiryCaseId: inquiry.id,
      clearExisting: true,
    });
    return NextResponse.json({ success: true, inquiry: { id: inquiry.id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit inquiry";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
