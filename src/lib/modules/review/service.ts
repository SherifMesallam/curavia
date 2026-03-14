import { prisma } from "@/lib/db";
import type { CreateReviewData } from "./validations";

/** Get effective rating for aggregation: overall ?? rating */
function getEffectiveRating(r: { overall?: number | null; rating?: number | null }): number | null {
  const v = r.overall ?? r.rating;
  return v != null ? v : null;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  /** Category averages (when available) */
  professionalism?: number;
  communication?: number;
  cleanliness?: number;
  outcome?: number;
}

export function computeReviewSummary(reviews: { overall?: number | null; rating?: number | null; professionalism?: number | null; communication?: number | null; cleanliness?: number | null; outcome?: number | null }[]): ReviewSummary | null {
  if (reviews.length === 0) return null;

  const overalls = reviews.map(getEffectiveRating).filter((v): v is number => v != null);
  if (overalls.length === 0) return null;

  const avg = overalls.reduce((a, b) => a + b, 0) / overalls.length;

  const cat = (key: "professionalism" | "communication" | "cleanliness" | "outcome") => {
    const vals = reviews.map((r) => (r as Record<string, number | null | undefined>)[key]).filter((v): v is number => typeof v === "number");
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : undefined;
  };

  return {
    averageRating: Math.round(avg * 10) / 10,
    totalReviews: overalls.length,
    professionalism: cat("professionalism"),
    communication: cat("communication"),
    cleanliness: cat("cleanliness"),
    outcome: cat("outcome"),
  };
}

export async function createReview(
  patientId: string,
  data: CreateReviewData
) {
  if (data.doctorId && data.clinicId) {
    throw new Error("Provide doctorId or clinicId, not both");
  }
  if (!data.doctorId && !data.clinicId) {
    throw new Error("Provide doctorId or clinicId");
  }

  let verifiedPatient = false;
  if (data.inquiryCaseId) {
    const completed = await prisma.consultationRequest.findFirst({
      where: {
        inquiryCaseId: data.inquiryCaseId,
        inquiryCase: { patientId },
        status: "COMPLETED",
      },
    });
    verifiedPatient = !!completed;
  }

  const existing = await prisma.review.findFirst({
    where: {
      patientId,
      ...(data.doctorId ? { doctorId: data.doctorId } : {}),
      ...(data.clinicId ? { clinicId: data.clinicId } : {}),
      ...(data.inquiryCaseId ? { inquiryCaseId: data.inquiryCaseId } : {}),
    },
  });
  if (existing) throw new Error("You have already submitted a review for this provider");

  return prisma.review.create({
    data: {
      patientId,
      doctorId: data.doctorId ?? null,
      clinicId: data.clinicId ?? null,
      inquiryCaseId: data.inquiryCaseId ?? null,
      professionalism: data.professionalism,
      communication: data.communication,
      cleanliness: data.cleanliness,
      outcome: data.outcome,
      overall: data.overall,
      comment: data.comment,
      verifiedPatient,
      status: "PENDING",
    },
    include: {
      doctor: { include: { clinic: true, specialization: true } },
      clinic: true,
    },
  });
}

export async function updateReviewStatus(
  reviewId: string,
  status: "APPROVED" | "REJECTED" | "HIDDEN" | "FLAGGED",
  adminId: string
) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error("Review not found");

  return prisma.review.update({
    where: { id: reviewId },
    data: { status },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { clinic: true, specialization: true } },
      clinic: true,
    },
  });
}

export async function getReviewsForModeration() {
  return prisma.review.findMany({
    where: { status: { in: ["PENDING", "FLAGGED"] } },
    include: {
      patient: { include: { user: true } },
      doctor: { include: { clinic: true, specialization: true } },
      clinic: true,
      inquiryCase: { include: { procedure: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllReviewsForAdmin(filters?: { status?: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN" | "FLAGGED" }) {
  const where: { status?: { in: ("PENDING" | "APPROVED" | "REJECTED" | "HIDDEN" | "FLAGGED")[] } } = {};
  if (filters?.status) {
    where.status = { in: [filters.status] };
  }
  return prisma.review.findMany({
    where: Object.keys(where).length ? where : undefined,
    include: {
      patient: { include: { user: true } },
      doctor: { include: { clinic: true, specialization: true } },
      clinic: true,
      inquiryCase: { include: { procedure: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
