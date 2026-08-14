import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function StudentDashboardPage() {
  const session = await getSession();
  const student = session?.studentId
    ? await db.student.findUnique({
        where: { id: session.studentId },
        include: { branch: true, section: { include: { course: true } } },
      })
    : null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {student ? `${student.firstName} ${student.lastName}` : "Welcome"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {student ? (
            <>
              <p className="text-muted-foreground">
                Admission No. {student.admissionNumber} · {student.branch.name}
              </p>
              <p className="text-muted-foreground">
                {student.section ? `${student.section.course.name} - ${student.section.name}` : "Not yet assigned to a section"}
              </p>
              <StatusBadge tone={student.status === "ACTIVE" ? "success" : "neutral"} className="w-fit">
                {student.status === "ACTIVE" ? "Active" : student.status}
              </StatusBadge>
            </>
          ) : (
            <p className="text-muted-foreground">Your student profile hasn&apos;t been linked yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Attendance, homework, exams, fees, and timetable will appear here as those modules roll out.
        </CardContent>
      </Card>
    </div>
  );
}
