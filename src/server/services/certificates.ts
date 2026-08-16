import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

export async function listTcStudents(
  params: TableParams,
  scopeBranchId: string | null,
  filters: { issued: boolean; courseId?: string },
) {
  const where = {
    status: "ACTIVE" as const,
    deletedAt: null,
    sectionId: { not: null },
    tcEligible: true,
    tcIssued: filters.issued,
    ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
    ...(filters.courseId ? { section: { courseId: filters.courseId } } : {}),
    ...(params.q
      ? {
          OR: [
            { firstName: { contains: params.q, mode: "insensitive" as const } },
            { lastName: { contains: params.q, mode: "insensitive" as const } },
            { admissionNumber: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const orderBy = { firstName: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.student.findMany({
      where,
      orderBy,
      ...toPrismaSkipTake(params),
      include: { branch: true, section: { include: { course: true } } },
    }),
    db.student.count({ where }),
  ]);

  return { rows, totalCount };
}
