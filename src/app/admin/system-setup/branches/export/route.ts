import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listAllBranchesForExport } from "@/server/services/branches";
import { toCsvResponse } from "@/lib/data-table/csv";

export async function GET(request: Request) {
  let session;
  try {
    session = await requirePermission("system.branches", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const q = new URL(request.url).searchParams.get("q") ?? "";
  const rows = await listAllBranchesForExport(q, session.branchId);
  return toCsvResponse(
    rows.map((r) => ({
      Name: r.name,
      Organization: r.organization.name,
      City: r.city ?? "",
      Address: r.address ?? "",
      Phone: r.phone ?? "",
    })),
    "branches.csv",
  );
}
