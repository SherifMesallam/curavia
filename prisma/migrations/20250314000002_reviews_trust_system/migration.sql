-- AlterEnum: Add HIDDEN and FLAGGED to ReviewStatus
ALTER TYPE "ReviewStatus" ADD VALUE 'HIDDEN';
ALTER TYPE "ReviewStatus" ADD VALUE 'FLAGGED';

-- AlterTable: Add new Review columns
ALTER TABLE "Review" ADD COLUMN "professionalism" INTEGER;
ALTER TABLE "Review" ADD COLUMN "communication" INTEGER;
ALTER TABLE "Review" ADD COLUMN "cleanliness" INTEGER;
ALTER TABLE "Review" ADD COLUMN "outcome" INTEGER;
ALTER TABLE "Review" ADD COLUMN "overall" INTEGER;
ALTER TABLE "Review" ADD COLUMN "verified_patient" BOOLEAN NOT NULL DEFAULT false;

-- Make rating optional (for backward compatibility)
ALTER TABLE "Review" ALTER COLUMN "rating" DROP NOT NULL;
