import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listStaffAttendanceReport } from "@/server/services/staff-attendance";
import { UrlDateInput } from "@/components/shared/url-date-input";
import { OdTable } from "./od-table";

export default async function StaffAttendanceReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("hr.attendance", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "date", dir: "desc" });
  const dateFrom = typeof sp.dateFrom === "string" ? sp.dateFrom : undefined;
  const dateTo = typeof sp.dateTo === "string" ? sp.dateTo : undefined;

  const { rows, totalCount } = await listStaffAttendanceReport(params, { branchId: session.branchId, dateFrom, dateTo });

  const exportQuery = new URLSearchParams({
    q: params.q,
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  }).toString();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Staff Attendance / OD Report</h1>
        <p className="text-sm text-muted-foreground">Everyone marked Absent, Half day, On duty, or Leave — filter by date range.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <UrlDateInput paramKey="dateFrom" label="From" />
        <UrlDateInput paramKey="dateTo" label="To" />
      </div>
      <OdTable rows={rows} totalCount={totalCount} params={params} exportQuery={exportQuery} />
    </div>
  );
}
