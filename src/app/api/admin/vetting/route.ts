import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { entityType, entityId, decision, note } = body as {
      entityType: "doctor" | "clinic";
      entityId: string;
      decision: "approve" | "reject" | "request_info";
      note?: string;
    };
    if (!entityType || !entityId || !decision) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const status =
      decision === "approve"
        ? "APPROVED"
        : decision === "reject"
          ? "REJECTED"
          : "REQUEST_INFO";

    if (entityType === "doctor") {
      await prisma.doctor.update({
        where: { id: entityId },
        data: {
          status,
          approvedAt: decision === "approve" ? new Date() : undefined,
          approvedById: decision === "approve" ? session.id : undefined,
        },
      });
    } else {
      await prisma.clinic.update({
        where: { id: entityId },
        data: {
          status,
          approvedAt: decision === "approve" ? new Date() : undefined,
          approvedById: decision === "approve" ? session.id : undefined,
        },
      });
    }

    await prisma.vettingReview.create({
      data: {
        [entityType === "doctor" ? "doctorId" : "clinicId"]: entityId,
        reviewerId: session.id,
        decision: status,
        notes: note ?? undefined,
      },
    });

    if (decision === "request_info" && note) {
      await prisma.adminNote.create({
        data: {
          entityType: entityType === "doctor" ? "Doctor" : "Clinic",
          entityId,
          adminId: session.id,
          content: `[Request for additional information]\n${note}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Vetting failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
