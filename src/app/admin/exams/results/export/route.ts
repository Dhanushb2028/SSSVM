import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { getExamResultsForSection } from "@/server/services/exam-results";
import { toCsvResponse } from "@/lib/data-table/csv";

export async function GET(request: Request) {
  try {
    await requirePermission("exams.reports", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId") ?? "";
  const sectionId = searchParams.get("sectionId") ?? "";
  if (!examId || !sectionId) return new Response("Missing examId/sectionId", { status: 400 });

  const results = await getExamResultsForSection(examId, sectionId);

  return toCsvResponse(
    results.map((r) => ({
      "Admission No.": r.student.admissionNumber,
      Name: `${r.student.firstName} ${r.student.lastName}`,
      ...Object.fromEntries(r.subjectResults.map((sr) => [sr.subjectName, sr.marksObtained ?? ""])),
      Total: r.totalMarks,
      "Max Total": r.maxTotal,
      Rank: r.rank ?? "",
    })),
    "result-report.csv",
  );
}
