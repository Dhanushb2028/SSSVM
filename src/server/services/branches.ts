import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

const SORT_FIELDS = new Set(["name", "city", "createdAt"]);

export async function listBranches(params: TableParams, scopeBranchId: string | null) {
  const where = {
    deletedAt: null,
    ...(scopeBranchId ? { id: scopeBranchId } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { city: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "name"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.branch.findMany({ where, orderBy, ...toPrismaSkipTake(params), include: { organization: true } }),
    db.branch.count({ where }),
  ]);

  return { rows, totalCount };
}

export async function listAllBranchesForExport(q: string, scopeBranchId: string | null) {
  return db.branch.findMany({
    where: {
      deletedAt: null,
      ...(scopeBranchId ? { id: scopeBranchId } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    },
    orderBy: { name: "asc" },
    include: { organization: true },
  });
}

export async function listOrganizationsForPicker() {
  return db.organization.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
}
