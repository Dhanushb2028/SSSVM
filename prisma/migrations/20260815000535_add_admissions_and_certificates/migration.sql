-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'VISITED', 'APPLIED', 'ADMITTED', 'LOST');

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "category" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "tcIssuedDate" TIMESTAMP(3),
ADD COLUMN     "tcNumber" TEXT;

-- CreateTable
CREATE TABLE "marketing_officers" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "marketing_officers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_enquiries" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "courseId" TEXT,
    "studentName" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "source" TEXT,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "assignedMeoId" TEXT,
    "feeCommitment" DOUBLE PRECISION,
    "notes" TEXT,
    "convertedStudentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketing_officers_branchId_idx" ON "marketing_officers"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "admission_enquiries_convertedStudentId_key" ON "admission_enquiries"("convertedStudentId");

-- CreateIndex
CREATE INDEX "admission_enquiries_branchId_idx" ON "admission_enquiries"("branchId");

-- CreateIndex
CREATE INDEX "admission_enquiries_status_idx" ON "admission_enquiries"("status");

-- AddForeignKey
ALTER TABLE "marketing_officers" ADD CONSTRAINT "marketing_officers_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_assignedMeoId_fkey" FOREIGN KEY ("assignedMeoId") REFERENCES "marketing_officers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_enquiries" ADD CONSTRAINT "admission_enquiries_convertedStudentId_fkey" FOREIGN KEY ("convertedStudentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
