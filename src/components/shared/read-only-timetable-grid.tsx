import { WEEKDAYS, PERIODS } from "@/server/services/timetable";

type Entry = {
  weekday: string;
  period: number;
  subject: { name: string };
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

export function ReadOnlyTimetableGrid({ entries }: { entries: Entry[] }) {
  const byKey = new Map(entries.map((e) => [`${e.weekday}-${e.period}`, e]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
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
            <tr key={period} className="border-b border-border last:border-0">
              <th scope="row" className="px-2 py-1 text-left font-medium text-muted-foreground">
                {period}
              </th>
              {WEEKDAYS.map((day) => {
                const entry = byKey.get(`${day}-${period}`);
                return (
                  <td key={day} className="px-2 py-1 text-foreground">
                    {entry ? (
                      <div>
                        <p>{entry.subject.name}</p>
                        {entry.teacher && (
                          <p className="text-xs text-muted-foreground">
                            {entry.teacher.firstName} {entry.teacher.lastName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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
