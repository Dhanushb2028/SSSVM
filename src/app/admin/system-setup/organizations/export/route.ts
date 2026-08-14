import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listAllOrganizationsForExport } from "@/server/services/organizations";
import { toCsvResponse } from "@/lib/data-table/csv";

export async function GET(request: Request) {
  try {
    await requirePermission("system.organizations", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const q = new URL(request.url).searchParams.get("q") ?? "";
  const rows = await listAllOrganizationsForExport(q);
  return toCsvResponse(
    rows.map((r) => ({ Name: r.name, Created: r.createdAt.toISOString() })),
    "organizations.csv",
  );
}
