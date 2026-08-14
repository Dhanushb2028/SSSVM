import { WEEKDAYS, PERIODS } from "@/server/services/timetable";
import { TimetableCellDialog } from "@/components/shared/timetable-cell-dialog";

type Entry = {
  weekday: string;
  period: number;
  subjectId: string;
  subject: { name: string };
  teacherId: string | null;
  teacher: { firstName: string; lastName: string } | null;
};

const WEEKDAY_LABEL: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

export function TimetableGrid({
  sectionId,
  entries,
  subjects,
  teachers,
}: {
  sectionId: string;
  entries: Entry[];
  subjects: { id: string; name: string }[];
  teachers: { id: string; firstName: string; lastName: string }[];
}) {
  const byKey = new Map(entries.map((e) => [`${e.weekday}-${e.period}`, e]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-sm">
        <caption className="sr-only">Weekly timetable</caption>
        <thead>
          <tr>
            <th scope="col" className="px-2 py-2 text-left font-medium text-muted-foreground">
              Period
            </th>
            {WEEKDAYS.map((day) => (
              <th key={day} scope="col" className="px-2 py-2 text-left font-medium text-muted-foreground">
                {WEEKDAY_LABEL[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period}>
              <th scope="row" className="px-2 py-1 text-left font-medium text-muted-foreground">
                {period}
              </th>
              {WEEKDAYS.map((day) => {
                const entry = byKey.get(`${day}-${period}`);
                return (
                  <td key={day} className="px-1 py-1">
                    <TimetableCellDialog
                      sectionId={sectionId}
                      weekday={day}
                      period={period}
                      subjects={subjects}
                      teachers={teachers}
                      current={
                        entry
                          ? {
                              subjectId: entry.subjectId,
                              subjectName: entry.subject.name,
                              teacherId: entry.teacherId,
                              teacherName: entry.teacher ? `${entry.teacher.firstName} ${entry.teacher.lastName}` : null,
                            }
                          : undefined
                      }
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
