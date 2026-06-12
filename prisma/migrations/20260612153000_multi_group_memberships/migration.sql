-- CreateTable
CREATE TABLE "GroupMember" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("userId","groupId")
);

-- Preserve existing single-group memberships before removing User.groupId.
INSERT INTO "GroupMember" ("userId", "groupId", "joinedAt")
SELECT "id", "groupId", CURRENT_TIMESTAMP
FROM "User"
WHERE "groupId" IS NOT NULL
ON CONFLICT ("userId", "groupId") DO NOTHING;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_groupId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "groupId";

-- CreateIndex
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
