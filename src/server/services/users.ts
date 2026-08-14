import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

const SORT_FIELDS = new Set(["username", "createdAt", "lastLoginAt"]);

export async function listUsers(params: TableParams, scopeBranchId: string | null) {
  const where = {
    ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
    ...(params.q
      ? {
          OR: [
            { username: { contains: params.q, mode: "insensitive" as const } },
            { name: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "username"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.user.findMany({
      where,
      orderBy,
      ...toPrismaSkipTake(params),
      include: { branch: true, permissionProfile: true },
    }),
    db.user.count({ where }),
  ]);

  return { rows, totalCount };
}
