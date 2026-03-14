import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const specializationId = searchParams.get("specializationId");

  const doctors = await prisma.doctor.findMany({
    where: {
      status: "APPROVED",
      ...(specializationId ? { specializationId } : {}),
    },
    include: { specialization: true, clinic: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return NextResponse.json({ doctors });
}
