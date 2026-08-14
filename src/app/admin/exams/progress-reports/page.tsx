import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { SectionPickerSelect } from "@/components/shared/section-picker-select";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import { ExamStudentSelector } from "@/components/shared/exam-student-selector";

export default async function ProgressReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("exams.progress_reports", "VIEW");
  const sp = await searchParams;
  const sectionId = typeof sp.sectionId === "string" ? sp.sectionId : undefined;
  const examId = typeof sp.examId === "string" ? sp.examId : undefined;

  const [sections, exams] = await Promise.all([
    db.section.findMany({
      where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
      include: { course: true, branch: true },
      orderBy: { name: "asc" },
    }),
    db.exam.findMany({ where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) }, orderBy: { startDate: "desc" } }),
  ]);

  const students = sectionId
    ? await db.student.findMany({ where: { sectionId, status: "ACTIVE", deletedAt: null }, orderBy: { firstName: "asc" } })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Progress Reports</h1>
        <p className="text-sm text-muted-foreground">Generate printable report cards per student.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <UrlFilterSelect paramKey="examId" placeholder="Select exam" options={exams.map((e) => ({ value: e.id, label: e.name }))} />
        <SectionPickerSelect paramKey="sectionId" label="Select section" sections={sections} />
      </div>
      {examId ? (
        <ExamStudentSelector students={students} examId={examId} printPath="/admin/exams/progress-reports/print" actionLabel="Generate Reports" />
      ) : (
        <p className="text-sm text-muted-foreground">Select an exam above.</p>
      )}
    </div>
  );
}
