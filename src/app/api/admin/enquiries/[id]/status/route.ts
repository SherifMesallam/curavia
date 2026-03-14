import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const VALID_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "MATCHED",
  "CONSULTATION_REQUESTED",
  "PACKAGE_PREPARED",
  "CLOSED",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { status } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const updated = await prisma.inquiryCase.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({ success: true, status: updated.status });
}
