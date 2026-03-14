-- AlterTable
ALTER TABLE "MatchRecommendation" ADD COLUMN "score" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "InquiryCase" ADD COLUMN "preferred_city" TEXT;
