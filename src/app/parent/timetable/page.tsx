import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getTimetableForSection } from "@/server/services/timetable";
import { ReadOnlyTimetableGrid } from "@/components/shared/read-only-timetable-grid";

export default async function ParentTimetablePage() {
  const session = await getSession();
  const links = session?.guardianId
    ? await db.studentGuardian.findMany({ where: { guardianId: session.guardianId }, include: { student: true } })
    : [];

  const childTimetables = await Promise.all(
    links.map(async (link) => ({
      student: link.student,
      entries: link.student.sectionId ? await getTimetableForSection(link.student.sectionId) : [],
    })),
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Timetable</h1>
      {childTimetables.length === 0 && <p className="text-sm text-muted-foreground">No children linked.</p>}
      {childTimetables.map(({ student, entries }) => (
        <div key={student.id} className="flex flex-col gap-2">
          {childTimetables.length > 1 && <h2 className="text-sm font-semibold text-foreground">{student.firstName}</h2>}
          {student.sectionId ? (
            <ReadOnlyTimetableGrid entries={entries} />
          ) : (
            <p className="text-sm text-muted-foreground">Not yet assigned to a section.</p>
          )}
        </div>
      ))}
    </div>
  );
}
