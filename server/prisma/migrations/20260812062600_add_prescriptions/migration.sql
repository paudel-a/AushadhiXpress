-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Prescription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pharmacistId" INTEGER,
    "documentUrl" TEXT NOT NULL,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prescription_userId_idx" ON "Prescription"("userId");

-- CreateIndex
CREATE INDEX "Prescription_pharmacistId_idx" ON "Prescription"("pharmacistId");

-- CreateIndex
CREATE INDEX "Prescription_status_idx" ON "Prescription"("status");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
