import { format } from "date-fns";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ExamTimetablePage() {
  const session = await requirePermissionOrRedirect("exams.timetable", "VIEW");
  const exams = await db.exam.findMany({
    where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
    include: { branch: true, subjects: { include: { subject: true }, orderBy: { examDate: "asc" } } },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Exam Timetable</h1>
        <p className="text-sm text-muted-foreground">Read-only view of each exam&apos;s per-subject date schedule.</p>
      </div>
      {exams.length === 0 ? (
        <p className="text-sm text-muted-foreground">No exams yet.</p>
      ) : (
        exams.map((exam) => (
          <Card key={exam.id}>
            <CardHeader>
              <CardTitle>{exam.name} — {exam.branch.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {exam.subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subjects mapped yet.</p>
              ) : (
                <ul className="flex flex-col gap-1 text-sm">
                  {exam.subjects.map((es) => (
                    <li key={es.id} className="flex justify-between gap-2 border-b border-border py-1 last:border-0">
                      <span>{es.subject.name}</span>
                      <span className="text-muted-foreground">{es.examDate ? format(es.examDate, "d MMM yyyy") : "Date TBD"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
