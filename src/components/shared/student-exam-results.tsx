import { format } from "date-fns";
import { listExamResultsForStudent } from "@/server/services/exam-results";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export async function StudentExamResults({ studentId }: { studentId: string }) {
  const results = await listExamResultsForStudent(studentId);

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No results published yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map(({ exam, result }) => (
        <Card key={exam.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>
              {exam.name} <span className="font-normal text-muted-foreground">({exam.examType.name})</span>
            </CardTitle>
            {exam.includeInRank && result!.rank && <StatusBadge tone="success">Rank {result!.rank}</StatusBadge>}
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">{format(exam.startDate, "d MMM yyyy")}</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="px-2 py-1 text-left font-medium text-muted-foreground">Subject</th>
                    <th scope="col" className="px-2 py-1 text-right font-medium text-muted-foreground">Marks</th>
                    <th scope="col" className="px-2 py-1 text-right font-medium text-muted-foreground">Max</th>
                    <th scope="col" className="px-2 py-1 text-left font-medium text-muted-foreground">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {result!.subjectResults.map((sr) => (
                    <tr key={sr.subjectId} className="border-b border-border last:border-0">
                      <td className="px-2 py-1 text-foreground">{sr.subjectName}</td>
                      <td className="px-2 py-1 text-right text-foreground">{sr.marksObtained ?? "—"}</td>
                      <td className="px-2 py-1 text-right text-foreground">{sr.maxMarks}</td>
                      <td className="px-2 py-1">
                        {sr.marksObtained === null ? (
                          <span className="text-muted-foreground">Pending</span>
                        ) : sr.passMarks !== null && sr.marksObtained < sr.passMarks ? (
                          <StatusBadge tone="danger">Fail</StatusBadge>
                        ) : (
                          <StatusBadge tone="success">Pass</StatusBadge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-foreground font-medium">
                    <td className="px-2 py-1 text-foreground">Total</td>
                    <td className="px-2 py-1 text-right text-foreground">{result!.totalMarks}</td>
                    <td className="px-2 py-1 text-right text-foreground">{result!.maxTotal}</td>
                    <td className="px-2 py-1 text-foreground">
                      {result!.maxTotal > 0 ? `${((result!.totalMarks / result!.maxTotal) * 100).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
