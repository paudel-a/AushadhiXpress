
-- Add medicineId as nullable so existing prescriptions are preserved.
ALTER TABLE "Prescription"
ADD COLUMN "medicineId" INTEGER;

-- Create an index for medicineId.
CREATE INDEX "Prescription_medicineId_idx"
ON "Prescription"("medicineId");

-- Add the foreign key to Medicine.
ALTER TABLE "Prescription"
ADD CONSTRAINT "Prescription_medicineId_fkey"
FOREIGN KEY ("medicineId")
REFERENCES "Medicine"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;