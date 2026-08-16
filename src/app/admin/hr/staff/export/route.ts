import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listAllStaffForExport } from "@/server/services/staff";
import { toCsvResponse } from "@/lib/data-table/csv";

export async function GET(request: Request) {
  let session;
  try {
    session = await requirePermission("hr.staff", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? undefined;
  const rows = await listAllStaffForExport(q, session.branchId, status);
  return toCsvResponse(
    rows.map((r) => ({
      "Employee Code": r.employeeCode,
      Name: `${r.firstName} ${r.lastName}`,
      Designation: r.designation,
      Department: r.department ?? "",
      "Employment Type": r.employmentType,
      Phone: r.phone,
      Email: r.email ?? "",
      Branch: r.branch.name,
      Status: r.status,
    })),
    "staff.csv",
  );
}
