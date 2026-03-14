export interface Specialization {
  id: string;
  name: string;
  slug: string;
  procedureCount?: number;
}

export interface Procedure {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specialization: Specialization;
  priceFrom?: number;
  doctorCount?: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  professionalism?: number;
  communication?: number;
  cleanliness?: number;
  outcome?: number;
}

export interface DoctorReview {
  id: string;
  patientName: string;
  overall: number | null;
  professionalism: number | null;
  communication: number | null;
  cleanliness: number | null;
  outcome: number | null;
  comment: string | null;
  verifiedPatient: boolean;
  createdAt: string;
}

export interface ClinicBasic {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  avatarUrl?: string;
  bio: string | null;
  yearsExperience: number | null;
  specialization: Specialization | null;
  clinic: ClinicBasic | null;
  procedures: Procedure[];
  reviewSummary: ReviewSummary | null;
  reviews?: DoctorReview[];
  priceFrom?: number;
  isVerified: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  description: string | null;
  doctorCount?: number;
  reviewSummary: ReviewSummary | null;
  priceFrom?: number;
  isVerified: boolean;
}

export interface MarketplaceFilters {
  specialization?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
}
