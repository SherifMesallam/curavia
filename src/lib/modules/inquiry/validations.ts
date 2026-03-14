import { z } from "zod";

export const CONTACT_METHODS = ["email", "phone", "whatsapp", "telegram", "other"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

// ── Per-step schemas for the wizard ──────────────────────────────────────────

export const step1Schema = z.object({
  specializationId: z.string().min(1, "Select a specialization"),
  procedureId: z.string().min(1, "Select a procedure"),
});

export const step2Schema = z.object({
  patientCountry: z.string().min(1, "Country is required"),
  age: z.number({ invalid_type_error: "Age is required" }).min(1).max(120),
  budgetMin: z.number({ invalid_type_error: "Min budget is required" }).min(0),
  budgetMax: z.number({ invalid_type_error: "Max budget is required" }).min(0),
}).refine((d) => d.budgetMax >= d.budgetMin, {
  message: "Max budget must be ≥ min budget",
  path: ["budgetMax"],
});

export const step3Schema = z.object({
  travelDateStart: z.string().min(1, "Start date is required"),
  travelDateEnd: z.string().min(1, "End date is required"),
  preferredCity: z.string().optional(),
}).refine((d) => new Date(d.travelDateEnd) >= new Date(d.travelDateStart), {
  message: "End date must be after start date",
  path: ["travelDateEnd"],
});

export const step4Schema = z.object({
  caseDescription: z.string().min(10, "Description must be at least 10 characters"),
});

export const step5Schema = z.object({
  preferredContactMethods: z.array(z.enum(CONTACT_METHODS)).min(1, "Select at least one method"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  contactTelegram: z.string().optional(),
  contactOther: z.string().optional(),
}).refine((d) => !d.preferredContactMethods.includes("phone") || !!d.contactPhone, {
  message: "Phone number is required", path: ["contactPhone"],
}).refine((d) => !d.preferredContactMethods.includes("whatsapp") || !!d.contactWhatsapp, {
  message: "WhatsApp number is required", path: ["contactWhatsapp"],
}).refine((d) => !d.preferredContactMethods.includes("telegram") || !!d.contactTelegram, {
  message: "Telegram username/number is required", path: ["contactTelegram"],
}).refine((d) => !d.preferredContactMethods.includes("other") || !!d.contactOther, {
  message: "Please specify your contact method", path: ["contactOther"],
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;

export const inquiryFormSchema = z
  .object({
    specializationId: z.string().min(1, "Select a specialization"),
    procedureId: z.string().min(1, "Select a procedure"),
    patientCountry: z.string().min(1, "Country is required"),
    preferredCity: z.string().optional(),
    age: z.number().min(1, "Age is required").max(120),
    budgetMin: z.number().min(0, "Min budget must be 0 or greater"),
    budgetMax: z.number().min(0, "Max budget must be 0 or greater"),
    travelDateStart: z.string().min(1, "Preferred travel start date is required"),
    travelDateEnd: z.string().min(1, "Preferred travel end date is required"),
    caseDescription: z.string().min(10, "Case description must be at least 10 characters"),
    consentAgreed: z.boolean().refine((v) => v === true, "You must agree to the consent"),
    // Contact methods
    preferredContactMethods: z
      .array(z.enum(CONTACT_METHODS))
      .min(1, "Select at least one preferred contact method"),
    contactEmail: z.string().email("Valid email is required"),
    contactPhone: z.string().optional(),
    contactWhatsapp: z.string().optional(),
    contactTelegram: z.string().optional(),
    contactOther: z.string().optional(),
    preferredDoctorId: z.string().optional(),
    medicalFiles: z
      .array(z.object({ fileKey: z.string(), fileName: z.string() }))
      .optional()
      .default([]),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Max budget must be >= min budget",
    path: ["budgetMax"],
  })
  .refine((data) => new Date(data.travelDateEnd) >= new Date(data.travelDateStart), {
    message: "End date must be after start date",
    path: ["travelDateEnd"],
  })
  .refine(
    (data) => !data.preferredContactMethods.includes("phone") || !!data.contactPhone,
    { message: "Phone number is required when phone is selected", path: ["contactPhone"] }
  )
  .refine(
    (data) => !data.preferredContactMethods.includes("whatsapp") || !!data.contactWhatsapp,
    { message: "WhatsApp number is required when WhatsApp is selected", path: ["contactWhatsapp"] }
  )
  .refine(
    (data) => !data.preferredContactMethods.includes("telegram") || !!data.contactTelegram,
    { message: "Telegram username/number is required when Telegram is selected", path: ["contactTelegram"] }
  )
  .refine(
    (data) => !data.preferredContactMethods.includes("other") || !!data.contactOther,
    { message: "Please specify your preferred contact method", path: ["contactOther"] }
  );

export type InquiryFormData = z.infer<typeof inquiryFormSchema>;
