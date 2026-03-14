import type {
  Doctor,
  Clinic,
  Procedure,
  Specialization,
  MarketplaceFilters,
} from "@/types/marketplace";
import {
  mockDoctors,
  mockClinics,
  mockProcedures,
  mockSpecializations,
} from "./mock-marketplace";

const USE_PRISMA = Boolean(process.env.DATABASE_URL);

/**
 * Data layer for marketplace.
 * Uses Prisma (APPROVED providers only) when DATABASE_URL is set.
 * Falls back to mock data otherwise.
 */

export async function getSpecializations(): Promise<Specialization[]> {
  if (USE_PRISMA) {
    try {
      const pm = await import("./marketplace-prisma");
      return pm.getSpecializationsPrisma();
    } catch {
      return mockSpecializations;
    }
  }
  return mockSpecializations;
}

export async function getProcedures(filters?: MarketplaceFilters): Promise<Procedure[]> {
  if (USE_PRISMA) {
    try {
      const pm = await import("./marketplace-prisma");
      return pm.getProceduresPrisma(filters);
    } catch {
      // fall through to mock
    }
  }
  let procedures = [...mockProcedures];
  if (filters?.specialization) {
    procedures = procedures.filter(
      (p) => p.specialization.slug === filters.specialization
    );
  }
  if (filters?.priceMin !== undefined) {
    procedures = procedures.filter(
      (p) => (p.priceFrom ?? 0) >= filters.priceMin!
    );
  }
  if (filters?.priceMax !== undefined) {
    procedures = procedures.filter(
      (p) => (p.priceFrom ?? 0) <= filters.priceMax!
    );
  }
  return procedures;
}

export async function getProcedureBySlug(slug: string): Promise<Procedure | null> {
  if (USE_PRISMA) {
    try {
      const pm = await import("./marketplace-prisma");
      return pm.getProcedureBySlugPrisma(slug);
    } catch {
      // fall through
    }
  }
  return mockProcedures.find((p) => p.slug === slug) ?? null;
}

export async function getDoctors(filters?: MarketplaceFilters): Promise<Doctor[]> {
  if (USE_PRISMA) {
    try {
      const pm = await import("./marketplace-prisma");
      return pm.getDoctorsPrisma(filters);
    } catch {
      // fall through
    }
  }
  let doctors = [...mockDoctors];
  if (filters?.specialization) {
    doctors = doctors.filter(
      (d) => d.specialization?.slug === filters.specialization
    );
  }
  if (filters?.city) {
    doctors = doctors.filter(
      (d) => d.clinic?.city?.toLowerCase() === filters.city?.toLowerCase()
    );
  }
  if (filters?.priceMin !== undefined) {
    doctors = doctors.filter(
      (d) => (d.priceFrom ?? 0) >= filters.priceMin!
    );
  }
  if (filters?.priceMax !== undefined) {
    doctors = doctors.filter(
      (d) => (d.priceFrom ?? 0) <= filters.priceMax!
    );
  }
  return doctors;
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  if (USE_PRISMA) {
    try {
      const pm = await import("./marketplace-prisma");
      return pm.getDoctorBySlugPrisma(slug);
    } catch {
      // fall through
    }
  }
  return mockDoctors.find((d) => d.slug === slug) ?? null;
}

export async function getClinics(filters?: MarketplaceFilters): Promise<Clinic[]> {
  if (USE_PRISMA) {
    try {
      const pm = await import("./marketplace-prisma");
      return pm.getClinicsPrisma(filters);
    } catch {
      // fall through
    }
  }
  let clinics = [...mockClinics];
  if (filters?.city) {
    clinics = clinics.filter(
      (c) => c.city.toLowerCase() === filters.city?.toLowerCase()
    );
  }
  if (filters?.priceMin !== undefined) {
    clinics = clinics.filter(
      (c) => (c.priceFrom ?? 0) >= filters.priceMin!
    );
  }
  if (filters?.priceMax !== undefined) {
    clinics = clinics.filter(
      (c) => (c.priceFrom ?? 0) <= filters.priceMax!
    );
  }
  return clinics;
}

export async function getClinicBySlug(slug: string): Promise<Clinic | null> {
  if (USE_PRISMA) {
    try {
      const pm = await import("./marketplace-prisma");
      return pm.getClinicBySlugPrisma(slug);
    } catch {
      // fall through
    }
  }
  return mockClinics.find((c) => c.slug === slug) ?? null;
}

export async function getCities(): Promise<string[]> {
  if (USE_PRISMA) {
    try {
      const pm = await import("./marketplace-prisma");
      return pm.getCitiesPrisma();
    } catch {
      // fall through
    }
  }
  const cities = new Set(mockClinics.map((c) => c.city));
  return Array.from(cities).sort();
}
