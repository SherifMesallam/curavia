import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { addMedicalFileToInquiry } from "@/lib/modules/inquiry/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: inquiryCaseId } = await params;
  try {
    const body = await request.json();
    const { fileKey, fileName } = body as { fileKey: string; fileName: string };
    if (!fileKey || !fileName) {
      return NextResponse.json({ error: "fileKey and fileName required" }, { status: 400 });
    }
    await addMedicalFileToInquiry(inquiryCaseId, session.id, fileKey, fileName);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add file";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
