-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_medicineId_fkey";

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
