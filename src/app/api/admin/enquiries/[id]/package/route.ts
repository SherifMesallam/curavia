import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// GET — fetch the package for this enquiry (if any)
export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const pkg = await prisma.travelPackage.findFirst({ where: { inquiryCaseId: id } });
  return NextResponse.json({ package: pkg });
}

// POST — create a new package
export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { name, price, currency = "USD", description, inclusions, exclusions, recommendedDoctors, status = "DRAFT" } = body;

  if (!name || price == null) {
    return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
  }

  // Remove existing packages for this enquiry before creating a new one
  await prisma.travelPackage.deleteMany({ where: { inquiryCaseId: id } });

  const pkg = await prisma.travelPackage.create({
    data: {
      inquiryCaseId: id,
      name,
      slug: slugify(name),
      price,
      currency,
      description: description || null,
      inclusions: inclusions ? JSON.stringify(inclusions) : null,
      exclusions: exclusions ? JSON.stringify(exclusions) : null,
      recommendedDoctors: recommendedDoctors?.length ? JSON.stringify(recommendedDoctors) : null,
      status,
    },
  });

  // Bump the enquiry status to PACKAGE_PREPARED if publishing
  if (status === "PUBLISHED") {
    await prisma.inquiryCase.update({
      where: { id },
      data: { status: "PACKAGE_PREPARED" },
    });
  }

  return NextResponse.json({ package: pkg });
}

// PATCH — update the existing package
export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { name, price, currency, description, inclusions, exclusions, recommendedDoctors, status } = await req.json();

  const existing = await prisma.travelPackage.findFirst({ where: { inquiryCaseId: id } });
  if (!existing) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  const pkg = await prisma.travelPackage.update({
    where: { id: existing.id },
    data: {
      ...(name !== undefined && { name, slug: slugify(name) }),
      ...(price !== undefined && { price }),
      ...(currency !== undefined && { currency }),
      ...(description !== undefined && { description: description || null }),
      ...(inclusions !== undefined && { inclusions: JSON.stringify(inclusions) }),
      ...(exclusions !== undefined && { exclusions: JSON.stringify(exclusions) }),
      ...(recommendedDoctors !== undefined && { recommendedDoctors: recommendedDoctors?.length ? JSON.stringify(recommendedDoctors) : null }),
      ...(status !== undefined && { status }),
    },
  });

  if (status === "PUBLISHED") {
    await prisma.inquiryCase.update({
      where: { id },
      data: { status: "PACKAGE_PREPARED" },
    });
  }

  return NextResponse.json({ package: pkg });
}

// DELETE — remove the package
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.travelPackage.deleteMany({ where: { inquiryCaseId: id } });
  return NextResponse.json({ success: true });
}
