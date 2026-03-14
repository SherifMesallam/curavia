import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// Verify the caller has access to this inquiry (patient owns it, or admin)
async function authorize(session: { id: string; role: string }, inquiryCaseId: string) {
  if (session.role === "ADMIN") return true;
  if (session.role === "PATIENT") {
    const profile = await prisma.patientProfile.findUnique({ where: { userId: session.id } });
    if (!profile) return false;
    const c = await prisma.inquiryCase.findFirst({ where: { id: inquiryCaseId, patientId: profile.id } });
    return !!c;
  }
  return false;
}

// GET — fetch all messages for an inquiry
export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await authorize(session, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { inquiryCaseId: id },
    include: { sender: { select: { firstName: true, lastName: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

// POST — send a message
export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await authorize(session, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      inquiryCaseId: id,
      senderId: session.id,
      isAdmin: session.role === "ADMIN",
      content: content.trim(),
    },
    include: { sender: { select: { firstName: true, lastName: true, role: true } } },
  });

  return NextResponse.json({ message });
}
