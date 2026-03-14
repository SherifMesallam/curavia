import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return NextResponse.json({ success: true, user: { id: user.id, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
