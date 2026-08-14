import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

const SORT_FIELDS = new Set(["name", "createdAt"]);

export async function listPermissionProfiles(params: TableParams) {
  const where = params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : {};
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "name"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.permissionProfile.findMany({
      where,
      orderBy,
      ...toPrismaSkipTake(params),
      include: { grants: true, _count: { select: { users: true } } },
    }),
    db.permissionProfile.count({ where }),
  ]);

  return { rows, totalCount };
}

export async function listAllPermissionProfilesForPicker() {
  return db.permissionProfile.findMany({ orderBy: { name: "asc" } });
}
