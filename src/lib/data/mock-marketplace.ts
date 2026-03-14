import type {
  Doctor,
  Clinic,
  Procedure,
  Specialization,
  ReviewSummary,
} from "@/types/marketplace";

const dental: Specialization = {
  id: "spec-dental",
  name: "Dental",
  slug: "dental",
  procedureCount: 5,
};

const lasik: Specialization = {
  id: "spec-lasik",
  name: "LASIK",
  slug: "lasik",
  procedureCount: 3,
};

export const mockSpecializations: Specialization[] = [dental, lasik];

export const mockProcedures: Procedure[] = [
  {
    id: "proc-1",
    name: "Dental Implants",
    slug: "dental-implants",
    description: "Full tooth replacement with titanium implants",
    specialization: dental,
    priceFrom: 800,
    doctorCount: 3,
  },
  {
    id: "proc-2",
    name: "Veneers",
    slug: "veneers",
    description: "Thin porcelain shells for cosmetic teeth improvement",
    specialization: dental,
    priceFrom: 400,
    doctorCount: 2,
  },
  {
    id: "proc-3",
    name: "LASIK Surgery",
    slug: "lasik-surgery",
    description: "Laser vision correction",
    specialization: lasik,
    priceFrom: 1200,
    doctorCount: 1,
  },
  {
    id: "proc-4",
    name: "SMILE",
    slug: "smile",
    description: "Minimally invasive laser vision correction",
    specialization: lasik,
    priceFrom: 1500,
    doctorCount: 1,
  },
];

const cairoDental: Clinic = {
  id: "clinic-1",
  name: "Cairo Dental Center",
  slug: "cairo-dental-center",
  city: "Cairo",
  country: "Egypt",
  description:
    "Premium dental clinic specializing in implants and cosmetic dentistry.",
  doctorCount: 2,
  reviewSummary: { averageRating: 4.9, totalReviews: 24 },
  priceFrom: 400,
  isVerified: true,
};

const visionCare: Clinic = {
  id: "clinic-2",
  name: "Vision Care Egypt",
  slug: "vision-care-egypt",
  city: "Cairo",
  country: "Egypt",
  description: "Leading LASIK and refractive surgery center.",
  doctorCount: 1,
  reviewSummary: { averageRating: 4.7, totalReviews: 18 },
  priceFrom: 1200,
  isVerified: true,
};

export const mockClinics: Clinic[] = [cairoDental, visionCare];

export const mockDoctors: Doctor[] = [
  {
    id: "doc-1",
    firstName: "Omar",
    lastName: "Elsayed",
    slug: "dr-omar-elsayed",
    bio: "Board-certified dentist with 12 years of experience in dental implants.",
    yearsExperience: 12,
    specialization: dental,
    clinic: cairoDental,
    procedures: [mockProcedures[0], mockProcedures[1]],
    reviewSummary: { averageRating: 4.9, totalReviews: 15 },
    priceFrom: 800,
    isVerified: true,
  },
  {
    id: "doc-2",
    firstName: "Nour",
    lastName: "Ibrahim",
    slug: "dr-nour-ibrahim",
    bio: "Specialist in veneers and smile design.",
    yearsExperience: 8,
    specialization: dental,
    clinic: cairoDental,
    procedures: [mockProcedures[1]],
    reviewSummary: { averageRating: 4.8, totalReviews: 9 },
    priceFrom: 400,
    isVerified: true,
  },
  {
    id: "doc-3",
    firstName: "Karim",
    lastName: "Fathy",
    slug: "dr-karim-fathy",
    bio: "Ophthalmologist specializing in refractive surgery. Over 5,000 LASIK procedures.",
    yearsExperience: 15,
    specialization: lasik,
    clinic: visionCare,
    procedures: [mockProcedures[2], mockProcedures[3]],
    reviewSummary: { averageRating: 4.7, totalReviews: 18 },
    priceFrom: 1200,
    isVerified: true,
  },
];
