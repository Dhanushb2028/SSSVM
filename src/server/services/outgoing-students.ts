import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

const SORT_FIELDS = new Set(["firstName", "leftDate"]);

export async function listOutgoingStudents(params: TableParams, scopeBranchId: string | null) {
  const where = {
    status: "LEFT" as const,
    deletedAt: null,
    ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
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
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "leftDate"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.student.findMany({ where, orderBy, ...toPrismaSkipTake(params), include: { branch: true, section: { include: { course: true } } } }),
    db.student.count({ where }),
  ]);

  return { rows, totalCount };
}
