-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rating" TEXT;

-- CreateTable
CREATE TABLE "QuarterPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuarterPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuarterPlanTopic" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuarterPlanTopic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuarterPlan" ADD CONSTRAINT "QuarterPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuarterPlanTopic" ADD CONSTRAINT "QuarterPlanTopic_planId_fkey" FOREIGN KEY ("planId") REFERENCES "QuarterPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuarterPlanTopic" ADD CONSTRAINT "QuarterPlanTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
