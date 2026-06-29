-- AlterTable
ALTER TABLE "Match"
ADD COLUMN "scoreWinner" TEXT,
ADD COLUMN "scoreDuration" TEXT,
ADD COLUMN "penaltyHomeGoals" INTEGER,
ADD COLUMN "penaltyAwayGoals" INTEGER;
