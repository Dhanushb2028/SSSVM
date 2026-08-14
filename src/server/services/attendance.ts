import "server-only";
import { db } from "@/lib/db";
import { Prisma, type AttendanceStatus } from "@prisma/client";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

export async function getRosterWithAttendance(sectionId: string, date: string) {
  const [students, existing] = await Promise.all([
    db.student.findMany({
      where: { sectionId, status: "ACTIVE", deletedAt: null },
      orderBy: { firstName: "asc" },
    }),
    db.attendance.findMany({ where: { sectionId, date: new Date(date) } }),
  ]);

  const byStudent = new Map(existing.map((a) => [a.studentId, a.status]));
  return students.map((s) => ({ ...s, status: byStudent.get(s.id) ?? ("PRESENT" as AttendanceStatus) }));
}

export async function listAbsenteeReport(
  params: TableParams,
  filters: { sectionIds: string[]; dateFrom?: string; dateTo?: string },
) {
  const where = {
    status: { not: "PRESENT" as AttendanceStatus },
    ...(filters.sectionIds.length > 0 ? { sectionId: { in: filters.sectionIds } } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          date: {
            ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
            ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
          },
        }
      : {}),
    ...(params.q
      ? {
          student: {
            OR: [
              { firstName: { contains: params.q, mode: "insensitive" as const } },
              { lastName: { contains: params.q, mode: "insensitive" as const } },
              { admissionNumber: { contains: params.q, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };

  const [rows, totalCount] = await Promise.all([
    db.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      ...toPrismaSkipTake(params),
      include: { student: true, section: { include: { course: true, branch: true } } },
    }),
    db.attendance.count({ where }),
  ]);

  return { rows, totalCount };
}

/** Section-level attendance % over a date range, used by the class-teacher summary and later the student/parent view. */
export async function getSectionAttendanceSummary(sectionId: string, dateFrom: string, dateTo: string) {
  const rows = await db.$queryRaw<{ status: AttendanceStatus; count: bigint }[]>(Prisma.sql`
    SELECT status, COUNT(*) as count
    FROM attendance
    WHERE "sectionId" = ${sectionId} AND date >= ${new Date(dateFrom)} AND date <= ${new Date(dateTo)}
    GROUP BY status
  `);
  return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
}
