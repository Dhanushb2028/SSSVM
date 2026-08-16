import "server-only";
import { db } from "@/lib/db";

export async function getAdmissionsReport(branchId: string, dateFrom?: string, dateTo?: string) {
  // dateTo is a plain YYYY-MM-DD from a date input, which parses to midnight UTC — add a day
  // and use an exclusive upper bound so the entire final day is actually included.
  const dateToExclusive = dateTo ? new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000) : undefined;
  const where = {
    branchId,
    status: "ADMITTED" as const,
    ...(dateFrom || dateTo
      ? {
          updatedAt: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateToExclusive ? { lt: dateToExclusive } : {}),
          },
        }
      : {}),
  };

  const admitted = await db.admissionEnquiry.findMany({
    where,
    include: { assignedMeo: true, course: true },
  });

  const byMeo = new Map<string, { name: string; count: number }>();
  const byCourse = new Map<string, { name: string; count: number }>();
  let totalFeeCommitment = 0;

  for (const e of admitted) {
    totalFeeCommitment += e.feeCommitment ?? 0;
    const meoKey = e.assignedMeo ? e.assignedMeo.id : "unassigned";
    const meoName = e.assignedMeo ? `${e.assignedMeo.firstName} ${e.assignedMeo.lastName}` : "Unassigned";
    const meoEntry = byMeo.get(meoKey) ?? { name: meoName, count: 0 };
    meoEntry.count += 1;
    byMeo.set(meoKey, meoEntry);

    const courseKey = e.course ? e.course.id : "unspecified";
    const courseName = e.course ? e.course.name : "Not specified";
    const courseEntry = byCourse.get(courseKey) ?? { name: courseName, count: 0 };
    courseEntry.count += 1;
    byCourse.set(courseKey, courseEntry);
  }

  return {
    total: admitted.length,
    totalFeeCommitment,
    byStaff: Array.from(byMeo.values()),
    byCourse: Array.from(byCourse.values()),
  };
}
