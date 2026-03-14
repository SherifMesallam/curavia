/**
 * Doctor matching service.
 * Orchestrates the matching engine and persists recommendations.
 */

import { prisma } from "@/lib/db";
import { RuleBasedMatchingEngine } from "./rule-based-engine";
import type { InquiryCaseForMatching, DoctorForMatching } from "./types";

const engine = new RuleBasedMatchingEngine();

export interface MatchAndStoreOptions {
  inquiryCaseId: string;
  /** Optional: run matching only for this inquiry (re-run). Clears existing recommendations. */
  clearExisting?: boolean;
  /** Optional: admin/system user ID if manually triggered */
  recommendedById?: string | null;
}

/**
 * Runs the matching engine for an inquiry case and stores results in MatchRecommendation.
 * Returns the ranked list of recommended doctors with scores.
 */
export async function matchAndStoreRecommendations(
  options: MatchAndStoreOptions
): Promise<{ doctorId: string; score: number; rank: number }[]> {
  const { inquiryCaseId, clearExisting = true, recommendedById = null } = options;

  const inquiryCase = await prisma.inquiryCase.findUnique({
    where: { id: inquiryCaseId },
    include: { procedure: true, specialization: true },
  });

  if (!inquiryCase) {
    throw new Error("Inquiry case not found");
  }

  const inquiryForMatching: InquiryCaseForMatching = {
    id: inquiryCase.id,
    procedureId: inquiryCase.procedureId,
    specializationId: inquiryCase.specializationId,
    budgetMin: inquiryCase.budgetMin ? Number(inquiryCase.budgetMin) : null,
    budgetMax: inquiryCase.budgetMax ? Number(inquiryCase.budgetMax) : null,
    preferredCity: inquiryCase.preferredCity,
  };

  const doctors = await prisma.doctor.findMany({
    where: { status: "APPROVED" },
    include: {
      clinic: true,
      specialization: true,
      procedures: { include: { procedure: true } },
      reviews: { where: { status: "APPROVED" } },
    },
  });

  const candidates: DoctorForMatching[] = doctors.map((d) => {
    const approvedReviews = d.reviews ?? [];
    const ratings = approvedReviews
      .map((r) => r.overall ?? r.rating)
      .filter((v): v is number => v != null);
    const avgRating = ratings.length > 0
      ? ratings.reduce((s, v) => s + v, 0) / ratings.length
      : null;

    return {
      id: d.id,
      specializationId: d.specializationId,
      status: d.status,
      clinicCity: d.clinic?.city ?? null,
      procedureIds: d.procedures.map((dp) => dp.procedureId),
      averageRating: avgRating,
      reviewCount: approvedReviews.length,
      procedurePriceMin: null, // TODO: add ProcedurePrice when schema supports it
      supportedLanguages: [], // TODO: add Doctor.supportedLanguages when schema supports it
    };
  });

  const results = await engine.match(inquiryForMatching, candidates);

  if (clearExisting) {
    await prisma.matchRecommendation.deleteMany({
      where: { inquiryCaseId },
    });
  }

  const toCreate = results.map((r, i) => ({
    inquiryCaseId,
    doctorId: r.doctorId,
    rank: i + 1,
    score: r.score,
    recommendedById,
  }));

  await prisma.matchRecommendation.createMany({
    data: toCreate,
  });

  return results.map((r, i) => ({
    doctorId: r.doctorId,
    score: r.score,
    rank: i + 1,
  }));
}

/**
 * Get stored recommendations for an inquiry case.
 */
export async function getRecommendations(inquiryCaseId: string) {
  return prisma.matchRecommendation.findMany({
    where: { inquiryCaseId },
    include: {
      doctor: {
        include: {
          clinic: true,
          specialization: true,
          procedures: { include: { procedure: true } },
        },
      },
    },
    orderBy: { rank: "asc" },
  });
}
