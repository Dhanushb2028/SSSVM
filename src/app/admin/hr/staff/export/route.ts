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

  const q = new URL(request.url).searchParams.get("q") ?? "";
  const rows = await listAllStaffForExport(q, session.branchId);
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
