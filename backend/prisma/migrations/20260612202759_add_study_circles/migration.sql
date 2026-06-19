-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "circleRunId" TEXT,
ADD COLUMN     "phaseOrder" INTEGER;

-- CreateTable
CREATE TABLE "StudyCircle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyCircle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CirclePhase" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "durationMins" INTEGER NOT NULL,
    "label" TEXT,
    "categoryId" TEXT,
    "topicId" TEXT,

    CONSTRAINT "CirclePhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CircleRun" (
    "id" TEXT NOT NULL,
    "circleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "currentPhaseOrder" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CircleRun_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_circleRunId_fkey" FOREIGN KEY ("circleRunId") REFERENCES "CircleRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyCircle" ADD CONSTRAINT "StudyCircle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CirclePhase" ADD CONSTRAINT "CirclePhase_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "StudyCircle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CirclePhase" ADD CONSTRAINT "CirclePhase_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CirclePhase" ADD CONSTRAINT "CirclePhase_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircleRun" ADD CONSTRAINT "CircleRun_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "StudyCircle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircleRun" ADD CONSTRAINT "CircleRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
