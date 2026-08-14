import { Download } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { getSectionStrength, getCourseAbstract } from "@/server/services/sis-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SisReportsPage() {
  const session = await requirePermissionOrRedirect("sis.reports", "VIEW");
  const [strength, abstract_] = await Promise.all([
    getSectionStrength(session.branchId),
    getCourseAbstract(session.branchId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Strength &amp; Abstract Reports</h1>
        <p className="text-sm text-muted-foreground">Read-only headcount summaries by section and by course/branch.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Section-wise Strength</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <a href="/admin/sis/reports/strength-export">
              <Download aria-hidden="true" />
              Export CSV
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Branch</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Course</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Section</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Strength</th>
                </tr>
              </thead>
              <tbody>
                {strength.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-foreground">{r.branch}</td>
                    <td className="px-3 py-2 text-foreground">{r.course}</td>
                    <td className="px-3 py-2 text-foreground">{r.section}</td>
                    <td className="px-3 py-2 text-right text-foreground">
                      {r.strength}
                      {r.capacity ? ` / ${r.capacity}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Branch / Course Abstract</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <a href="/admin/sis/reports/abstract-export">
              <Download aria-hidden="true" />
              Export CSV
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Branch</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Course</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Sections</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Strength</th>
                </tr>
              </thead>
              <tbody>
                {abstract_.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-foreground">{r.branch}</td>
                    <td className="px-3 py-2 text-foreground">{r.course}</td>
                    <td className="px-3 py-2 text-right text-foreground">{r.sectionCount}</td>
                    <td className="px-3 py-2 text-right text-foreground">{r.strength}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
