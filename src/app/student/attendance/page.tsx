import { getSession } from "@/lib/auth/session";
import { StudentAttendanceSummary } from "@/components/shared/student-attendance-summary";

export default async function StudentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const month = typeof sp.month === "string" ? sp.month : undefined;

  if (!session?.studentId) {
    return <p className="text-sm text-muted-foreground">Your student profile hasn&apos;t been linked yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Attendance</h1>
      <StudentAttendanceSummary studentId={session.studentId} monthParam={month} basePath="/student/attendance" />
    </div>
  );
}
