import { prisma } from "@/lib/db";
import { computeReviewSummary } from "@/lib/modules/review/service";
import type {
  Doctor,
  Clinic,
  Procedure,
  Specialization,
  MarketplaceFilters,
} from "@/types/marketplace";

/**
 * Prisma-based marketplace - only returns APPROVED providers.
 * Verified providers are visible in the public marketplace.
 */

export async function getSpecializationsPrisma(): Promise<Specialization[]> {
  const items = await prisma.specialization.findMany({
    include: { _count: { select: { procedures: true } } },
    orderBy: { name: "asc" },
  });
  return items.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    procedureCount: s._count.procedures,
  }));
}

export async function getProceduresPrisma(
  filters?: MarketplaceFilters
): Promise<Procedure[]> {
  const where: { specialization?: { slug: string } } = {};
  if (filters?.specialization) {
    where.specialization = { slug: filters.specialization };
  }
  const items = await prisma.procedure.findMany({
    where,
    include: { specialization: true },
    orderBy: { name: "asc" },
  });
  let result = items.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    specialization: {
      id: p.specialization.id,
      name: p.specialization.name,
      slug: p.specialization.slug,
    },
    priceFrom: undefined as number | undefined,
    doctorCount: undefined as number | undefined,
  }));
  // Price filter would need a join - simplified for now
  if (filters?.priceMin !== undefined) {
    result = result.filter((p) => (p.priceFrom ?? 0) >= filters.priceMin!);
  }
  if (filters?.priceMax !== undefined) {
    result = result.filter((p) => (p.priceFrom ?? 0) <= filters.priceMax!);
  }
  return result;
}

export async function getProcedureBySlugPrisma(
  slug: string
): Promise<Procedure | null> {
  const p = await prisma.procedure.findUnique({
    where: { slug },
    include: { specialization: true },
  });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    specialization: {
      id: p.specialization.id,
      name: p.specialization.name,
      slug: p.specialization.slug,
    },
    priceFrom: undefined,
    doctorCount: undefined,
  };
}

export async function getDoctorsPrisma(
  filters?: MarketplaceFilters
): Promise<Doctor[]> {
  const where: { status: "APPROVED"; specialization?: { slug: string }; clinic?: { city: string } } = {
    status: "APPROVED",
  };
  if (filters?.specialization) {
    where.specialization = { slug: filters.specialization };
  }
  if (filters?.city) {
    where.clinic = { city: filters.city };
  }
  const items = await prisma.doctor.findMany({
    where,
    include: {
      clinic: true,
      specialization: true,
      procedures: { include: { procedure: true } },
      reviews: { where: { status: "APPROVED" } },
    },
    orderBy: { createdAt: "desc" },
  });
  const doctors: Doctor[] = items.map((d) => {
    const approvedReviews = d.reviews ?? [];
    const reviewSummary = computeReviewSummary(approvedReviews);
    return {
      id: d.id,
      firstName: d.firstName,
      lastName: d.lastName,
      slug: d.slug,
      avatarUrl: `/images/doctors/${d.slug}.jpg`,
      bio: d.bio,
      yearsExperience: d.yearsExperience,
      specialization: d.specialization
        ? { id: d.specialization.id, name: d.specialization.name, slug: d.specialization.slug }
        : null,
      clinic: d.clinic
        ? { id: d.clinic.id, name: d.clinic.name, slug: d.clinic.slug, city: d.clinic.city, country: d.clinic.country }
        : null,
      procedures: d.procedures.map((dp) => ({
        id: dp.procedure.id,
        name: dp.procedure.name,
        slug: dp.procedure.slug,
        description: dp.procedure.description,
        specialization: d.specialization!
          ? { id: d.specialization.id, name: d.specialization.name, slug: d.specialization.slug }
          : { id: "", name: "", slug: "" },
      })),
      reviewSummary,
      priceFrom: undefined,
      isVerified: true,
    };
  });
  return doctors;
}

export async function getDoctorBySlugPrisma(slug: string): Promise<Doctor | null> {
  const d = await prisma.doctor.findFirst({
    where: { slug, status: "APPROVED" },
    include: {
      clinic: true,
      specialization: true,
      procedures: { include: { procedure: true } },
      reviews: {
        where: { status: "APPROVED" },
        include: { patient: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!d) return null;
  const reviewSummary = computeReviewSummary(d.reviews ?? []);
  return {
    id: d.id,
    firstName: d.firstName,
    lastName: d.lastName,
    slug: d.slug,
    avatarUrl: `/images/doctors/${d.slug}.jpg`,
    bio: d.bio,
    yearsExperience: d.yearsExperience,
    specialization: d.specialization
      ? { id: d.specialization.id, name: d.specialization.name, slug: d.specialization.slug }
      : null,
    clinic: d.clinic
      ? { id: d.clinic.id, name: d.clinic.name, slug: d.clinic.slug, city: d.clinic.city, country: d.clinic.country }
      : null,
    procedures: d.procedures.map((dp) => ({
      id: dp.procedure.id,
      name: dp.procedure.name,
      slug: dp.procedure.slug,
      description: dp.procedure.description,
      specialization: d.specialization!
        ? { id: d.specialization.id, name: d.specialization.name, slug: d.specialization.slug }
        : { id: "", name: "", slug: "" },
    })),
    reviewSummary,
    reviews: (d.reviews ?? []).map((r) => ({
      id: r.id,
      patientName: `${r.patient.user.firstName} ${r.patient.user.lastName[0]}.`,
      overall: r.overall,
      professionalism: r.professionalism,
      communication: r.communication,
      cleanliness: r.cleanliness,
      outcome: r.outcome,
      comment: r.comment,
      verifiedPatient: r.verifiedPatient,
      createdAt: r.createdAt.toISOString(),
    })),
    priceFrom: undefined,
    isVerified: true,
  };
}

export async function getClinicsPrisma(
  filters?: MarketplaceFilters
): Promise<Clinic[]> {
  const where: { status: "APPROVED"; city?: string } = { status: "APPROVED" };
  if (filters?.city) {
    where.city = filters.city;
  }
  const items = await prisma.clinic.findMany({
    where,
    include: {
      _count: { select: { doctors: true } },
      reviews: { where: { status: "APPROVED" } },
    },
    orderBy: { name: "asc" },
  });
  return items.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    city: c.city,
    country: c.country,
    description: c.description,
    doctorCount: c._count.doctors,
    reviewSummary: computeReviewSummary(c.reviews ?? []),
    priceFrom: undefined,
    isVerified: true,
  }));
}

export async function getClinicBySlugPrisma(slug: string): Promise<Clinic | null> {
  const c = await prisma.clinic.findFirst({
    where: { slug, status: "APPROVED" },
    include: {
      _count: { select: { doctors: true } },
      reviews: { where: { status: "APPROVED" } },
    },
  });
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    city: c.city,
    country: c.country,
    description: c.description,
    doctorCount: c._count.doctors,
    reviewSummary: computeReviewSummary(c.reviews ?? []),
    priceFrom: undefined,
    isVerified: true,
  };
}

export async function getCitiesPrisma(): Promise<string[]> {
  const clinics = await prisma.clinic.findMany({
    where: { status: "APPROVED" },
    select: { city: true },
    distinct: ["city"],
  });
  return clinics.map((c) => c.city).sort();
}
