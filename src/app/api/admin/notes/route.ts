import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createNoteSchema = z.object({
  entityType: z.enum(["Doctor", "Clinic"]),
  entityId: z.string().min(1),
  content: z.string().min(1),
});

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");
  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType and entityId required" }, { status: 400 });
  }

  const notes = await prisma.adminNote.findMany({
    where: { entityType, entityId },
    include: { admin: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const note = await prisma.adminNote.create({
      data: {
        entityType: parsed.data.entityType,
        entityId: parsed.data.entityId,
        adminId: session.id,
        content: parsed.data.content,
      },
      include: { admin: { select: { firstName: true, lastName: true } } },
    });
    return NextResponse.json({ note });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create note";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
