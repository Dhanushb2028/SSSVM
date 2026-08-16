import { Download } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { getExamResultsForSection, getGradeTrends } from "@/server/services/exam-results";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import { SectionPickerSelect } from "@/components/shared/section-picker-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GradeTrendChart } from "./grade-trend-chart";

export default async function ResultReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("exams.reports", "VIEW");
  const sp = await searchParams;
  const examId = typeof sp.examId === "string" ? sp.examId : undefined;
  const sectionId = typeof sp.sectionId === "string" ? sp.sectionId : undefined;

  const [exams, sections] = await Promise.all([
    db.exam.findMany({ where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) }, orderBy: { startDate: "desc" } }),
    db.section.findMany({
      where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
      include: { course: true, branch: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const results = examId && sectionId ? await getExamResultsForSection(examId, sectionId) : [];
  const gradeTrends = await getGradeTrends(session.branchId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Result Reports</h1>
        <p className="text-sm text-muted-foreground">Filter by exam and section to see marks, totals, and rank.</p>
      </div>

      {gradeTrends.rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grade trends by class</CardTitle>
            <CardDescription>Average % scored across exams, one line per class (course).</CardDescription>
          </CardHeader>
          <CardContent>
            <GradeTrendChart rows={gradeTrends.rows} courseNames={gradeTrends.courseNames} />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <UrlFilterSelect paramKey="examId" placeholder="Select exam" options={exams.map((e) => ({ value: e.id, label: e.name }))} />
        <SectionPickerSelect paramKey="sectionId" label="Select section" sections={sections} />
        {examId && sectionId && (
          <Button asChild variant="secondary" size="sm">
            <a href={`/admin/exams/results/export?examId=${examId}&sectionId=${sectionId}`}>
              <Download aria-hidden="true" />
              Export CSV
            </a>
          </Button>
        )}
      </div>

      {results.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Admission No.</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                {results[0].subjectResults.map((sr) => (
                  <th key={sr.subjectId} scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">
                    {sr.subjectName}
                  </th>
                ))}
                <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">%</th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Rank</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.student.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">{r.student.admissionNumber}</td>
                  <td className="px-3 py-2">{r.student.firstName} {r.student.lastName}</td>
                  {r.subjectResults.map((sr) => (
                    <td key={sr.subjectId} className="px-3 py-2 text-right">{sr.marksObtained ?? "—"}</td>
                  ))}
                  <td className="px-3 py-2 text-right font-medium">{r.totalMarks}</td>
                  <td className="px-3 py-2 text-right">{r.maxTotal > 0 ? `${((r.totalMarks / r.maxTotal) * 100).toFixed(1)}%` : "—"}</td>
                  <td className="px-3 py-2 text-right">{r.rank ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
