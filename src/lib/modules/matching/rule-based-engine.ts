/**
 * Rule-based doctor matching engine.
 * Scores doctors by specialization, procedure, budget, rating, verified status,
 * clinic city, and supported languages.
 * Can be replaced with an ML/AI engine by implementing DoctorMatchingEngine.
 */

import type { DoctorMatchingEngine, InquiryCaseForMatching, DoctorForMatching, MatchResult } from "./types";

const WEIGHTS = {
  specializationMatch: 25,
  procedureMatch: 30,
  budgetCompatibility: 15,
  doctorRating: 15,
  verifiedStatus: 10,
  clinicCity: 5,
  supportedLanguages: 5,
} as const;

export class RuleBasedMatchingEngine implements DoctorMatchingEngine {
  async match(
    inquiryCase: InquiryCaseForMatching,
    candidates: DoctorForMatching[]
  ): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for (const doctor of candidates) {
      const breakdown = {
        specializationMatch: this.scoreSpecialization(inquiryCase, doctor),
        procedureMatch: this.scoreProcedure(inquiryCase, doctor),
        budgetCompatibility: this.scoreBudget(inquiryCase, doctor),
        doctorRating: this.scoreRating(doctor),
        verifiedStatus: this.scoreVerified(doctor),
        clinicCity: this.scoreClinicCity(inquiryCase, doctor),
        supportedLanguages: this.scoreLanguages(inquiryCase, doctor),
      };

      const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

      results.push({
        doctorId: doctor.id,
        score: Math.round(score * 100) / 100,
        scoreBreakdown: breakdown,
      });
    }

    // Sort by score descending, then by doctor id for stability
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.doctorId.localeCompare(b.doctorId);
    });

    return results;
  }

  private scoreSpecialization(inquiry: InquiryCaseForMatching, doctor: DoctorForMatching): number {
    if (!inquiry.specializationId) return WEIGHTS.specializationMatch * 0.5; // Partial if no spec
    if (doctor.specializationId === inquiry.specializationId) return WEIGHTS.specializationMatch;
    return 0;
  }

  private scoreProcedure(inquiry: InquiryCaseForMatching, doctor: DoctorForMatching): number {
    if (!inquiry.procedureId) return WEIGHTS.procedureMatch * 0.5; // Partial if no proc
    if (doctor.procedureIds.includes(inquiry.procedureId)) return WEIGHTS.procedureMatch;
    return 0;
  }

  private scoreBudget(inquiry: InquiryCaseForMatching, doctor: DoctorForMatching): number {
    const min = inquiry.budgetMin;
    const max = inquiry.budgetMax;
    const price = doctor.procedurePriceMin;

    if (min == null && max == null) return WEIGHTS.budgetCompatibility; // No constraint
    if (price == null) return WEIGHTS.budgetCompatibility * 0.5; // No price data - partial

    if (min != null && price < min) return 0;
    if (max != null && price > max) return 0;
    return WEIGHTS.budgetCompatibility;
  }

  private scoreRating(doctor: DoctorForMatching): number {
    const rating = doctor.averageRating;
    if (rating == null || doctor.reviewCount === 0) return WEIGHTS.doctorRating * 0.3;
    // 1-5 scale → 0 to full points
    return (rating / 5) * WEIGHTS.doctorRating;
  }

  private scoreVerified(doctor: DoctorForMatching): number {
    return doctor.status === "APPROVED" ? WEIGHTS.verifiedStatus : 0;
  }

  private scoreClinicCity(inquiry: InquiryCaseForMatching, doctor: DoctorForMatching): number {
    const preferred = inquiry.preferredCity?.trim().toLowerCase();
    const city = doctor.clinicCity?.trim().toLowerCase();

    if (!preferred) return WEIGHTS.clinicCity; // No preference - full
    if (!city) return 0;
    return preferred === city ? WEIGHTS.clinicCity : 0;
  }

  private scoreLanguages(inquiry: InquiryCaseForMatching, doctor: DoctorForMatching): number {
    // Placeholder: no patient language preference or doctor languages in schema yet.
    // When added: match patient's preferred language against doctor.supportedLanguages.
    return WEIGHTS.supportedLanguages * 0.5; // Partial until we have data
  }
}
