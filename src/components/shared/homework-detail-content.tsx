import { notFound } from "next/navigation";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { getHomeworkDetail } from "@/server/services/homework";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function HomeworkDetailContent({ id }: { id: string }) {
  const homework = await getHomeworkDetail(id);
  if (!homework) notFound();

  const students = await db.student.findMany({
    where: { sectionId: homework.sectionId, status: "ACTIVE", deletedAt: null },
    orderBy: { firstName: "asc" },
  });
  const submittedByStudent = new Map(homework.submissions.map((s) => [s.studentId, s]));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {homework.subject.name} — {homework.section.course.name} - {homework.section.name}
        </h1>
        <p className="text-sm text-muted-foreground">Due {format(homework.dueDate, "d MMM yyyy")}</p>
        <p className="mt-2 text-sm text-foreground">{homework.description}</p>
        {homework.attachments.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {homework.attachments.map((a) => (
              <li key={a.id}>
                <a href={a.url} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                  {a.fileName}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission tracking ({homework.submissions.length}/{students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Student</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const submission = submittedByStudent.get(s.id);
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">{s.firstName} {s.lastName}</td>
                      <td className="px-3 py-2">
                        {submission ? (
                          submission.status === "LATE" ? (
                            <StatusBadge tone="warning">Submitted late</StatusBadge>
                          ) : (
                            <StatusBadge tone="success">Submitted</StatusBadge>
                          )
                        ) : (
                          <StatusBadge tone="neutral">Not submitted</StatusBadge>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {submission ? format(submission.submittedAt, "d MMM yyyy, h:mm a") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
