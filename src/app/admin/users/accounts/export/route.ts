import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listUsers } from "@/server/services/users";
import { toCsvResponse } from "@/lib/data-table/csv";
import { parseTableParams } from "@/lib/data-table/params";

export async function GET(request: Request) {
  let session;
  try {
    session = await requirePermission("users.accounts", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const params = parseTableParams(Object.fromEntries(searchParams), { pageSize: 100000 });
  const { rows } = await listUsers(params, session.branchId);

  return toCsvResponse(
    rows.map((r) => ({
      Name: r.name ?? "",
      Login: r.username ?? r.mobile ?? "",
      Role: r.role,
      Branch: r.branch?.name ?? "All branches",
      "Permission Profile": r.permissionProfile?.name ?? "Full access",
      Status: r.isActive ? "Active" : "Deactivated",
    })),
    "users.csv",
  );
}
