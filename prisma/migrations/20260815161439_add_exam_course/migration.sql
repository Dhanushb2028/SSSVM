-- AlterTable: add nullable first so we can backfill existing rows
ALTER TABLE "exams" ADD COLUMN     "courseId" TEXT;

-- Backfill: best-effort match by finding a course whose name (e.g. "Grade 5") appears in
-- the exam's name (e.g. "Unit Test 1 - Grade 5"), scoped to the exam's branch/organization.
UPDATE "exams" e
SET "courseId" = c.id
FROM "courses" c
JOIN "branches" b ON b."organizationId" = c."organizationId"
WHERE b.id = e."branchId"
  AND e.name ILIKE '%' || c.name || '%'
  AND e."courseId" IS NULL;

-- Fallback for any exam that couldn't be matched by name: pin to the branch's first course
-- so the migration can complete; these should be reviewed manually afterwards.
UPDATE "exams" e
SET "courseId" = (
  SELECT c.id FROM "courses" c
  JOIN "branches" b ON b."organizationId" = c."organizationId"
  WHERE b.id = e."branchId"
  ORDER BY c."orderIndex" ASC
  LIMIT 1
)
WHERE e."courseId" IS NULL;

ALTER TABLE "exams" ALTER COLUMN "courseId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "exams_courseId_idx" ON "exams"("courseId");

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
