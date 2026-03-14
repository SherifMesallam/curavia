-- AlterEnum: Update ConsultationStatus enum
-- Map PENDING -> REQUESTED, keep CONFIRMED, COMPLETED, CANCELLED, add PENDING_CONFIRMATION
ALTER TYPE "ConsultationStatus" RENAME TO "ConsultationStatus_old";
CREATE TYPE "ConsultationStatus" AS ENUM ('REQUESTED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "ConsultationRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ConsultationRequest" ALTER COLUMN "status" TYPE "ConsultationStatus" USING (
  CASE "status"::text
    WHEN 'PENDING' THEN 'REQUESTED'::"ConsultationStatus"
    ELSE "status"::text::"ConsultationStatus"
  END
);
ALTER TABLE "ConsultationRequest" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
DROP TYPE "ConsultationStatus_old";

-- AlterTable: Add proposedAt, patientNotes to ConsultationRequest
ALTER TABLE "ConsultationRequest" ADD COLUMN IF NOT EXISTS "proposed_at" TIMESTAMP(3);
ALTER TABLE "ConsultationRequest" ADD COLUMN IF NOT EXISTS "patient_notes" TEXT;

-- CreateIndex: Unique constraint on inquiryCaseId + doctorId (Prisma @@unique)
CREATE UNIQUE INDEX IF NOT EXISTS "ConsultationRequest_inquiryCaseId_doctorId_key" ON "ConsultationRequest"("inquiry_case_id", "doctor_id");
