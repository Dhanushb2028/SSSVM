import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeacherDashboardPage() {
  const session = await getSession();
  const staff = session?.staffMemberId
    ? await db.staffMember.findUnique({
        where: { id: session.staffMemberId },
        include: { branch: true, classesAsTeacher: { include: { course: true, academicYear: true } } },
      })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Welcome, {session?.displayName}</h1>
        <p className="text-sm text-muted-foreground">
          {staff ? `${staff.designation} · ${staff.branch.name}` : "Teacher"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your sections</CardTitle>
        </CardHeader>
        <CardContent>
          {staff && staff.classesAsTeacher.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {staff.classesAsTeacher.map((section) => (
                <li key={section.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium text-foreground">
                    {section.course.name} - {section.name}
                  </p>
                  <p className="text-muted-foreground">{section.academicYear.name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              You are not assigned as class teacher for any section yet. Attendance, homework, and marks-entry tools
              for your sections and subjects arrive in a later phase.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
