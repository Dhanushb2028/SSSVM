import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listHomeworkForStudent } from "@/server/services/homework";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function ParentHomeworkPage() {
  const session = await getSession();
  const links = session?.guardianId
    ? await db.studentGuardian.findMany({ where: { guardianId: session.guardianId }, include: { student: true } })
    : [];

  const childHomework = await Promise.all(
    links.map(async (link) => ({
      student: link.student,
      homework: link.student.sectionId ? await listHomeworkForStudent(link.student.id, link.student.sectionId) : [],
    })),
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Homework</h1>
      {links.length === 0 && <p className="text-sm text-muted-foreground">No children linked.</p>}
      {childHomework.map(({ student, homework }) => (
        <div key={student.id} className="flex flex-col gap-2">
          {links.length > 1 && <h2 className="text-sm font-semibold text-foreground">{student.firstName}</h2>}
          {homework.length === 0 ? (
            <p className="text-sm text-muted-foreground">No homework posted yet.</p>
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
                <CardContent className="text-sm text-foreground">{h.description}</CardContent>
              </Card>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
