import { format } from "date-fns";
import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listAbsenteeReport } from "@/server/services/attendance";
import { toCsvResponse } from "@/lib/data-table/csv";
import { parseTableParams } from "@/lib/data-table/params";

export async function GET(request: Request) {
  try {
    await requirePermission("attendance.reports", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const params = parseTableParams(Object.fromEntries(searchParams), { pageSize: 100000 });
  const sectionIds = (searchParams.get("sectionIds") ?? "").split(",").filter(Boolean);
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const { rows } = await listAbsenteeReport(params, { sectionIds, dateFrom, dateTo });

  return toCsvResponse(
    rows.map((r) => ({
      Date: format(r.date, "yyyy-MM-dd"),
      "Admission No.": r.student.admissionNumber,
      Name: `${r.student.firstName} ${r.student.lastName}`,
      Section: `${r.section.course.name} - ${r.section.name}`,
      Branch: r.section.branch.name,
      Status: r.status,
    })),
    "absentee-report.csv",
  );
}
