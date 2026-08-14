import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

const SORT_FIELDS = new Set(["name", "createdAt"]);

export async function listOrganizations(params: TableParams) {
  const where = {
    deletedAt: null,
    ...(params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : {}),
  };
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "name"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.organization.findMany({
      where,
      orderBy,
      ...toPrismaSkipTake(params),
      include: { _count: { select: { branches: { where: { deletedAt: null } } } } },
    }),
    db.organization.count({ where }),
  ]);

  return { rows, totalCount };
}

export async function listAllOrganizationsForExport(q: string) {
  return db.organization.findMany({
    where: { deletedAt: null, ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}) },
    orderBy: { name: "asc" },
  });
}
