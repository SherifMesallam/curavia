/**
 * Doctor matching engine types.
 * Designed as a service layer so the rule-based engine can be replaced
 * with ML/AI-based matching later.
 */

export interface InquiryCaseForMatching {
  id: string;
  procedureId: string | null;
  specializationId: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredCity: string | null;
}

export interface DoctorForMatching {
  id: string;
  specializationId: string | null;
  status: string;
  clinicCity: string | null;
  procedureIds: string[];
  averageRating: number | null;
  reviewCount: number;
  /** Min price for the requested procedure (if available). Not in schema yet - placeholder. */
  procedurePriceMin: number | null;
  /** Supported language codes. Not in schema yet - placeholder. */
  supportedLanguages: string[];
}

export interface MatchResult {
  doctorId: string;
  score: number;
  /** Breakdown for debugging/transparency */
  scoreBreakdown?: {
    specializationMatch: number;
    procedureMatch: number;
    budgetCompatibility: number;
    doctorRating: number;
    verifiedStatus: number;
    clinicCity: number;
    supportedLanguages: number;
  };
}

export interface DoctorMatchingEngine {
  /**
   * Returns a ranked list of recommended doctors with scores.
   * Can be implemented by rule-based logic or replaced with ML/AI.
   */
  match(
    inquiryCase: InquiryCaseForMatching,
    candidates: DoctorForMatching[]
  ): Promise<MatchResult[]>;
}
