import "server-only";
import { db } from "@/lib/db";
import type { StaffAttendanceStatus } from "@prisma/client";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

export async function getStaffRosterWithAttendance(branchId: string, date: string) {
  const [staff, existing] = await Promise.all([
    db.staffMember.findMany({
      where: { branchId, status: "ACTIVE", deletedAt: null },
      orderBy: { firstName: "asc" },
    }),
    db.staffAttendance.findMany({ where: { branchId, date: new Date(date) } }),
  ]);

  const byStaff = new Map(existing.map((a) => [a.staffMemberId, a.status]));
  return staff.map((s) => ({ ...s, status: byStaff.get(s.id) ?? ("PRESENT" as StaffAttendanceStatus) }));
}

export async function listStaffAttendanceReport(
  params: TableParams,
  filters: { branchId: string | null; dateFrom?: string; dateTo?: string },
) {
  const where = {
    status: { not: "PRESENT" as StaffAttendanceStatus },
    ...(filters.branchId ? { branchId: filters.branchId } : {}),
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
          staffMember: {
            OR: [
              { firstName: { contains: params.q, mode: "insensitive" as const } },
              { lastName: { contains: params.q, mode: "insensitive" as const } },
              { employeeCode: { contains: params.q, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };

  const [rows, totalCount] = await Promise.all([
    db.staffAttendance.findMany({
      where,
      orderBy: { date: "desc" },
      ...toPrismaSkipTake(params),
      include: { staffMember: true },
    }),
    db.staffAttendance.count({ where }),
  ]);

  return { rows, totalCount };
}
