import { format } from "date-fns";
import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listStaffAttendanceReport } from "@/server/services/staff-attendance";
import { toCsvResponse } from "@/lib/data-table/csv";
import { parseTableParams } from "@/lib/data-table/params";

export async function GET(request: Request) {
  let session;
  try {
    session = await requirePermission("hr.attendance", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const params = parseTableParams(Object.fromEntries(searchParams), { pageSize: 100000 });
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const { rows } = await listStaffAttendanceReport(params, { branchId: session.branchId, dateFrom, dateTo });

  return toCsvResponse(
    rows.map((r) => ({
      Date: format(r.date, "yyyy-MM-dd"),
      "Employee Code": r.staffMember.employeeCode,
      Name: `${r.staffMember.firstName} ${r.staffMember.lastName}`,
      Status: r.status,
      Remarks: r.remarks ?? "",
    })),
    "staff-attendance-report.csv",
  );
}
