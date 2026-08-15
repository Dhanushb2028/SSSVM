import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

const SORT_FIELDS = new Set(["firstName", "employeeCode", "designation", "joinDate"]);

export async function listStaff(params: TableParams, scopeBranchId: string | null, filters: { status?: string }) {
  const where = {
    deletedAt: null,
    ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
    ...(filters.status ? { status: filters.status as "ACTIVE" | "LEFT" } : {}),
    ...(params.q
      ? {
          OR: [
            { firstName: { contains: params.q, mode: "insensitive" as const } },
            { lastName: { contains: params.q, mode: "insensitive" as const } },
            { employeeCode: { contains: params.q, mode: "insensitive" as const } },
            { designation: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "firstName"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.staffMember.findMany({ where, orderBy, ...toPrismaSkipTake(params), include: { branch: true, user: true } }),
    db.staffMember.count({ where }),
  ]);

  return { rows, totalCount };
}

export async function listAllStaffForExport(q: string, scopeBranchId: string | null) {
  return db.staffMember.findMany({
    where: {
      deletedAt: null,
      ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" as const } },
              { lastName: { contains: q, mode: "insensitive" as const } },
              { employeeCode: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { firstName: "asc" },
    include: { branch: true },
  });
}

export async function getStaffDetail(id: string) {
  return db.staffMember.findUnique({
    where: { id },
    include: { branch: true, user: true, salaryStructure: { include: { salaryComponent: true } } },
  });
}
