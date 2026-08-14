import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { getExamResultForStudent } from "@/server/services/exam-results";
import { PrintButton } from "@/app/admin/sis/id-cards/print/print-button";

export default async function ProgressReportsPrintPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("exams.progress_reports", "VIEW");
  const sp = await searchParams;
  const examId = typeof sp.examId === "string" ? sp.examId : "";
  const ids = (typeof sp.ids === "string" ? sp.ids : "").split(",").filter(Boolean);

  const exam = await db.exam.findUnique({ where: { id: examId }, include: { examType: true } });
  if (!exam) return <p className="text-sm text-danger">Exam not found.</p>;

  const results = await Promise.all(ids.map((id) => getExamResultForStudent(examId, id)));

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print">
        <h1 className="text-xl font-semibold text-foreground">Progress Report Preview</h1>
        <p className="text-sm text-muted-foreground">{results.length} report(s) ready to print.</p>
      </div>
      <PrintButton />

      <div className="flex flex-col gap-6">
        {results.filter(Boolean).map((r) => (
          <div key={r!.student.id} className="rounded-lg border-2 border-primary p-5" style={{ breakInside: "avoid" }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Sree Siva Shankar Vidya Mandir — Progress Report
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <p><strong>Student:</strong> {r!.student.firstName} {r!.student.lastName}</p>
              <p><strong>Admission No.:</strong> {r!.student.admissionNumber}</p>
              <p><strong>Exam:</strong> {exam.name} ({exam.examType.name})</p>
              <p><strong>Rank:</strong> {exam.includeInRank ? (r!.rank ?? "Pending marks") : "N/A"}</p>
            </div>
            <table className="mt-3 w-full min-w-[300px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-2 py-1 text-left">Subject</th>
                  <th scope="col" className="px-2 py-1 text-right">Marks Obtained</th>
                  <th scope="col" className="px-2 py-1 text-right">Max Marks</th>
                  <th scope="col" className="px-2 py-1 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {r!.subjectResults.map((sr) => (
                  <tr key={sr.subjectId} className="border-b border-border last:border-0">
                    <td className="px-2 py-1">{sr.subjectName}</td>
                    <td className="px-2 py-1 text-right">{sr.marksObtained ?? "—"}</td>
                    <td className="px-2 py-1 text-right">{sr.maxMarks}</td>
                    <td className="px-2 py-1">
                      {sr.marksObtained === null
                        ? "Not entered"
                        : sr.passMarks !== null && sr.marksObtained < sr.passMarks
                          ? "Fail"
                          : "Pass"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-foreground font-medium">
                  <td className="px-2 py-1">Total</td>
                  <td className="px-2 py-1 text-right">{r!.totalMarks}</td>
                  <td className="px-2 py-1 text-right">{r!.maxTotal}</td>
                  <td className="px-2 py-1">{r!.maxTotal > 0 ? `${((r!.totalMarks / r!.maxTotal) * 100).toFixed(1)}%` : "—"}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
