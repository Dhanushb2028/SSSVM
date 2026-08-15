import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { getAdmissionsReport } from "@/server/services/admissions-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlDateInput } from "@/components/shared/url-date-input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default async function AdmissionsReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("admissions.reports", "VIEW");
  const sp = await searchParams;
  const dateFrom = typeof sp.dateFrom === "string" ? sp.dateFrom : undefined;
  const dateTo = typeof sp.dateTo === "string" ? sp.dateTo : undefined;

  const branch = session.branchId
    ? await db.branch.findUnique({ where: { id: session.branchId } })
    : await db.branch.findFirst({ where: { deletedAt: null } });
  const report = branch ? await getAdmissionsReport(branch.id, dateFrom, dateTo) : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Admissions Reporting</h1>
        <p className="text-sm text-muted-foreground">{branch?.name}</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <UrlDateInput paramKey="dateFrom" label="From" />
        <UrlDateInput paramKey="dateTo" label="To" />
        <Button asChild variant="secondary" size="sm">
          <a href={`/admin/admissions/reports/export?${new URLSearchParams({ ...(dateFrom ? { dateFrom } : {}), ...(dateTo ? { dateTo } : {}) }).toString()}`}>
            <Download aria-hidden="true" />
            Export CSV
          </a>
        </Button>
      </div>

      {report && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-6 text-sm">
              <p><strong className="text-lg text-foreground">{report.total}</strong> <span className="text-muted-foreground">admissions</span></p>
              <p><strong className="text-lg text-foreground">₹{report.totalFeeCommitment}</strong> <span className="text-muted-foreground">total fee commitment</span></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff-wise</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-1 text-sm">
                {report.byStaff.map((s) => (
                  <li key={s.name} className="flex justify-between border-b border-border py-1 last:border-0">
                    <span>{s.name}</span>
                    <span>{s.count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class / Division-wise</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-1 text-sm">
                {report.byCourse.map((c) => (
                  <li key={c.name} className="flex justify-between border-b border-border py-1 last:border-0">
                    <span>{c.name}</span>
                    <span>{c.count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
