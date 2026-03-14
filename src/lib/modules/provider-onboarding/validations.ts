import { z } from "zod";

const CREDENTIAL_TYPES = ["LICENSE", "CERTIFICATION", "DEGREE", "INSURANCE", "OTHER"] as const;
const PROVIDER_TYPES = ["DOCTOR", "CLINIC"] as const;

export const step1AccountSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const step2ProviderTypeSchema = z.object({
  providerType: z.enum(PROVIDER_TYPES),
});

export const step3PersonalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
});

export const step4ClinicInfoSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().default("Egypt"),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

export const step5ProceduresSchema = z.object({
  procedureIds: z.array(z.string()).min(1, "Select at least one procedure"),
  specializationId: z.string().optional(), // For doctor
});

export const step6PricingSchema = z.object({
  priceRanges: z.array(
    z.object({
      procedureId: z.string(),
      minPrice: z.number().min(0, "Min price must be 0 or greater"),
      maxPrice: z.number().min(0, "Max price must be 0 or greater"),
      currency: z.string().default("USD"),
    })
  ).min(1, "Add at least one price range"),
}).refine(
  (data) =>
    data.priceRanges.every((r) => r.maxPrice >= r.minPrice),
  { message: "Max price must be >= min price", path: ["priceRanges"] }
);

export const step7CredentialsSchema = z.object({
  credentials: z.array(
    z.object({
      type: z.enum(CREDENTIAL_TYPES),
      fileKey: z.string().min(1, "File is required"),
      fileName: z.string().min(1, "File name is required"),
    })
  ).min(1, "Upload at least one credential"),
});

export const step8FacilityImagesSchema = z.object({
  images: z.array(
    z.object({
      fileKey: z.string().min(1, "File is required"),
      fileName: z.string().min(1, "File name is required"),
      sortOrder: z.number().default(0),
    })
  ), // Min 1 for clinic, 0 for doctor - validated in service
});

export const step9SubmissionSchema = z.object({
  agreedToTerms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
});

// Combined draft schema for persistence
export const onboardingDraftSchema = z.object({
  providerType: z.enum(PROVIDER_TYPES),
  currentStep: z.number().min(1).max(9),
  step1: step1AccountSchema.optional(),
  step2: step2ProviderTypeSchema.optional(),
  step3: step3PersonalInfoSchema.optional(),
  step4: step4ClinicInfoSchema.optional(),
  step5: step5ProceduresSchema.optional(),
  step6: step6PricingSchema.optional(),
  step7: step7CredentialsSchema.optional(),
  step8: step8FacilityImagesSchema.optional(),
  step9: step9SubmissionSchema.optional(),
});

export type Step1Account = z.infer<typeof step1AccountSchema>;
export type Step2ProviderType = z.infer<typeof step2ProviderTypeSchema>;
export type Step3PersonalInfo = z.infer<typeof step3PersonalInfoSchema>;
export type Step4ClinicInfo = z.infer<typeof step4ClinicInfoSchema>;
export type Step5Procedures = z.infer<typeof step5ProceduresSchema>;
export type Step6Pricing = z.infer<typeof step6PricingSchema>;
export type Step7Credentials = z.infer<typeof step7CredentialsSchema>;
export type Step8FacilityImages = z.infer<typeof step8FacilityImagesSchema>;
export type Step9Submission = z.infer<typeof step9SubmissionSchema>;
export type OnboardingDraftData = z.infer<typeof onboardingDraftSchema>;
