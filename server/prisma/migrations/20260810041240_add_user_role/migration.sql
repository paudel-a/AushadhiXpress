-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'PHARMACIST');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER';
