import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

const SORT_FIELDS = new Set(["name", "createdAt"]);

export async function listSections(params: TableParams, scopeBranchId: string | null) {
  const where = {
    deletedAt: null,
    ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
    ...(params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : {}),
  };
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "name"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.section.findMany({
      where,
      orderBy,
      ...toPrismaSkipTake(params),
      include: {
        branch: true,
        course: true,
        academicYear: true,
        classTeacher: true,
        _count: { select: { students: { where: { deletedAt: null } } } },
      },
    }),
    db.section.count({ where }),
  ]);

  return { rows, totalCount };
}

export async function listSectionPickerData(scopeBranchId: string | null) {
  const [branches, courses, academicYears, teachers] = await Promise.all([
    db.branch.findMany({ where: { deletedAt: null, ...(scopeBranchId ? { id: scopeBranchId } : {}) }, orderBy: { name: "asc" } }),
    db.course.findMany({ where: { deletedAt: null }, orderBy: { orderIndex: "asc" } }),
    db.academicYear.findMany({
      where: { ...(scopeBranchId ? { branchId: scopeBranchId } : {}) },
      orderBy: { startDate: "desc" },
    }),
    db.staffMember.findMany({
      where: { deletedAt: null, ...(scopeBranchId ? { branchId: scopeBranchId } : {}) },
      orderBy: { firstName: "asc" },
    }),
  ]);
  return { branches, courses, academicYears, teachers };
}
