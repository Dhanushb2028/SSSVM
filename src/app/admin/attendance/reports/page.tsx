import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listAbsenteeReport } from "@/server/services/attendance";
import { db } from "@/lib/db";
import { SectionMultiFilter } from "@/components/shared/section-multi-filter";
import { UrlDateInput } from "@/components/shared/url-date-input";
import { AbsenteeTable } from "./absentee-table";

export default async function AbsenteeReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("attendance.reports", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "date", dir: "desc" });
  const sectionIds = (typeof sp.sectionIds === "string" ? sp.sectionIds : "").split(",").filter(Boolean);
  const dateFrom = typeof sp.dateFrom === "string" ? sp.dateFrom : undefined;
  const dateTo = typeof sp.dateTo === "string" ? sp.dateTo : undefined;

  const [{ rows, totalCount }, sections] = await Promise.all([
    listAbsenteeReport(params, { sectionIds, dateFrom, dateTo }),
    db.section.findMany({
      where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
      include: { course: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const exportQuery = new URLSearchParams({
    q: params.q,
    sectionIds: sectionIds.join(","),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  }).toString();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Absentee Report</h1>
        <p className="text-sm text-muted-foreground">Everyone marked Absent, Late, or Half day — filter by section and date range.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <UrlDateInput paramKey="dateFrom" label="From" />
        <UrlDateInput paramKey="dateTo" label="To" />
      </div>
      <SectionMultiFilter sections={sections} />
      <AbsenteeTable rows={rows} totalCount={totalCount} params={params} exportQuery={exportQuery} />
    </div>
  );
}
