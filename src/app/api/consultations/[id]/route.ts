import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  confirmConsultation,
  cancelConsultation,
  proposeTime,
  completeConsultation,
} from "@/lib/modules/consultation/service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action, proposedAt } = await req.json();

  try {
    if (action === "confirm") {
      const profile = await prisma.patientProfile.findUnique({ where: { userId: session.id } });
      if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      const result = await confirmConsultation(id, profile.id);
      return NextResponse.json({ consultation: result });
    }

    if (action === "propose" && session.role === "ADMIN") {
      const result = await proposeTime(id, new Date(proposedAt));
      return NextResponse.json({ consultation: result });
    }

    if (action === "complete" && session.role === "ADMIN") {
      const result = await completeConsultation(id);
      return NextResponse.json({ consultation: result });
    }

    if (action === "cancel") {
      const result = await cancelConsultation(id, session.id, session.role);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
