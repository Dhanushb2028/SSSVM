import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getTimetableForSection } from "@/server/services/timetable";
import { ReadOnlyTimetableGrid } from "@/components/shared/read-only-timetable-grid";

export default async function StudentTimetablePage() {
  const session = await getSession();
  const student = session?.studentId ? await db.student.findUnique({ where: { id: session.studentId } }) : null;

  if (!student) {
    return <p className="text-sm text-muted-foreground">Your student profile hasn&apos;t been linked yet.</p>;
  }
  if (!student.sectionId) {
    return <p className="text-sm text-muted-foreground">Not yet assigned to a section.</p>;
  }

  const entries = await getTimetableForSection(student.sectionId);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Timetable</h1>
      <ReadOnlyTimetableGrid entries={entries} />
    </div>
  );
}
