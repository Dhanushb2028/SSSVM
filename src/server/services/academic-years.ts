import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

const SORT_FIELDS = new Set(["name", "startDate", "endDate"]);

export async function listAcademicYears(params: TableParams, scopeBranchId: string | null) {
  const where = {
    ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
    ...(params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : {}),
  };
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "startDate"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.academicYear.findMany({ where, orderBy, ...toPrismaSkipTake(params), include: { branch: true } }),
    db.academicYear.count({ where }),
  ]);

  return { rows, totalCount };
}

export async function listAllAcademicYearsForExport(q: string, scopeBranchId: string | null) {
  return db.academicYear.findMany({
    where: {
      ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    },
    orderBy: { startDate: "desc" },
    include: { branch: true },
  });
}

export async function listBranchesForPicker(scopeBranchId: string | null) {
  return db.branch.findMany({
    where: { deletedAt: null, ...(scopeBranchId ? { id: scopeBranchId } : {}) },
    orderBy: { name: "asc" },
  });
}
