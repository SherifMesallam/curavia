import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        role: "PATIENT",
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
      },
    });
    await prisma.patientProfile.create({
      data: { userId: user.id },
    });
    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
