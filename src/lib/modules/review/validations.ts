import { z } from "zod";

const ratingSchema = z.number().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5");

export const createReviewSchema = z.object({
  doctorId: z.string().optional(),
  clinicId: z.string().optional(),
  inquiryCaseId: z.string().optional(),
  professionalism: ratingSchema,
  communication: ratingSchema,
  cleanliness: ratingSchema,
  outcome: ratingSchema,
  overall: ratingSchema,
  comment: z.string().min(10, "Comment must be at least 10 characters").max(2000),
}).refine(
  (data) => (data.doctorId ? 1 : 0) + (data.clinicId ? 1 : 0) === 1,
  { message: "Provide exactly one of doctorId or clinicId", path: ["doctorId"] }
);

export type CreateReviewData = z.infer<typeof createReviewSchema>;
