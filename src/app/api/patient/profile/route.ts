import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { patientProfile: true },
  });
  if (!user || !user.patientProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    bio: user.patientProfile.bio,
    country: user.patientProfile.country,
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { firstName, lastName, phone, bio, country } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { patientProfile: true },
  });
  if (!user || !user.patientProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.id },
      data: {
        ...(firstName != null && { firstName }),
        ...(lastName != null && { lastName }),
        ...(phone !== undefined && { phone }),
      },
    }),
    prisma.patientProfile.update({
      where: { id: user.patientProfile.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(country !== undefined && { country }),
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
