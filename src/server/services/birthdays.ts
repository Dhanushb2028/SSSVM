import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type BirthdayStudent = {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dob: Date;
  contactPhone: string | null;
  branchName: string;
  sectionLabel: string | null;
};

/** Uses the database's own notion of "today" (not the app server's) to sidestep timezone drift. */
export async function getTodaysBirthdays(scopeBranchId: string | null): Promise<BirthdayStudent[]> {
  const branchFilter = scopeBranchId ? Prisma.sql`AND s."branchId" = ${scopeBranchId}` : Prisma.empty;

  return db.$queryRaw<BirthdayStudent[]>`
    SELECT
      s.id,
      s."admissionNumber",
      s."firstName",
      s."lastName",
      s.dob,
      s."contactPhone",
      b.name AS "branchName",
      CASE WHEN sec.id IS NOT NULL THEN c.name || ' - ' || sec.name ELSE NULL END AS "sectionLabel"
    FROM students s
    JOIN branches b ON b.id = s."branchId"
    LEFT JOIN sections sec ON sec.id = s."sectionId"
    LEFT JOIN courses c ON c.id = sec."courseId"
    WHERE s."deletedAt" IS NULL
      AND s.status = 'ACTIVE'
      AND EXTRACT(MONTH FROM s.dob) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(DAY FROM s.dob) = EXTRACT(DAY FROM CURRENT_DATE)
      ${branchFilter}
    ORDER BY s."firstName" ASC
  `;
}
