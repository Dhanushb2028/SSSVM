import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listHomeworkForStudent } from "@/server/services/homework";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { HomeworkSubmitDialog } from "@/components/shared/homework-submit-dialog";

export default async function StudentHomeworkPage() {
  const session = await getSession();
  const student = session?.studentId ? await db.student.findUnique({ where: { id: session.studentId } }) : null;
  const homework = student?.sectionId ? await listHomeworkForStudent(student.id, student.sectionId) : [];

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-semibold text-foreground">Homework</h1>
      {homework.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">No homework posted yet.</CardContent>
        </Card>
      ) : (
        homework.map((h) => (
          <Card key={h.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{h.subject.name}</CardTitle>
              {h.mySubmission ? (
                h.mySubmission.status === "LATE" ? (
                  <StatusBadge tone="warning">Late</StatusBadge>
                ) : (
                  <StatusBadge tone="success">Submitted</StatusBadge>
                )
              ) : (
                <StatusBadge tone="pending">Due {format(h.dueDate, "d MMM")}</StatusBadge>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="text-foreground">{h.description}</p>
              {h.attachments.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {h.attachments.map((a) => (
                    <li key={a.id}>
                      <a href={a.url} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                        {a.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <HomeworkSubmitDialog homeworkId={h.id} alreadySubmitted={Boolean(h.mySubmission)} />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
