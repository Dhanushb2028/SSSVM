import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getStudentAttendanceSummary } from "@/server/services/attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AttendanceProgressChart } from "@/components/shared/attendance-progress-chart";

const STATUS_LABEL: Record<string, string> = { ABSENT: "Absent", LATE: "Late", HALF_DAY: "Half day" };
const STATUS_TONE: Record<string, "danger" | "warning"> = { ABSENT: "danger", LATE: "warning", HALF_DAY: "warning" };

function monthBounds(monthParam: string | undefined) {
  const now = new Date();
  const [year, month] = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
    ? monthParam.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);
  return { from, to, year, month };
}

export async function StudentAttendanceSummary({
  studentId,
  monthParam,
  basePath,
  compact,
}: {
  studentId: string;
  monthParam?: string;
  basePath?: string;
  compact?: boolean;
}) {
  const { from, to, year, month } = monthBounds(monthParam);
  const dateFrom = from.toISOString().slice(0, 10);
  const dateTo = to.toISOString().slice(0, 10);
  const summary = await getStudentAttendanceSummary(studentId, dateFrom, dateTo);

  const prevMonth = new Date(year, month - 2, 1);
  const nextMonth = new Date(year, month, 1);
  const prevParam = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextParam = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Attendance — {format(from, "MMMM yyyy")}</CardTitle>
        {summary.percentPresent !== null && (
          <StatusBadge tone={summary.percentPresent >= 75 ? "success" : "warning"}>{summary.percentPresent}% present</StatusBadge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {summary.totalMarked === 0 ? (
          <p className="text-sm text-muted-foreground">No attendance recorded for this month yet.</p>
        ) : (
          <AttendanceProgressChart
            present={summary.counts.PRESENT}
            absent={summary.counts.ABSENT}
            late={summary.counts.LATE}
            halfDay={summary.counts.HALF_DAY}
          />
        )}

        {!compact && (
          <>
            {basePath && (
              <div className="flex items-center justify-between">
                <Link href={`${basePath}?month=${prevParam}`} className="flex items-center gap-1 text-sm font-medium text-primary">
                  <ChevronLeft aria-hidden="true" className="size-4" />
                  Previous
                </Link>
                <Link href={`${basePath}?month=${nextParam}`} className="flex items-center gap-1 text-sm font-medium text-primary">
                  Next
                  <ChevronRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            )}
            {summary.nonPresentDays.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Not present</h3>
                <ul className="flex flex-col gap-1">
                  {summary.nonPresentDays.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-foreground">{format(r.date, "d MMM yyyy")}</span>
                      <StatusBadge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</StatusBadge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
