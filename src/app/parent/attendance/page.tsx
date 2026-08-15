import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { StudentAttendanceSummary } from "@/components/shared/student-attendance-summary";

function monthBounds(monthParam: string | undefined) {
  const now = new Date();
  const [year, month] = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
    ? monthParam.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  return { year, month };
}

export default async function ParentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const month = typeof sp.month === "string" ? sp.month : undefined;

  const links = session?.guardianId
    ? await db.studentGuardian.findMany({ where: { guardianId: session.guardianId }, include: { student: true } })
    : [];

  const { year, month: monthNum } = monthBounds(month);
  const prevMonth = new Date(year, monthNum - 2, 1);
  const nextMonth = new Date(year, monthNum, 1);
  const prevParam = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextParam = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(year, monthNum - 1, 1), "MMMM yyyy")}</p>
      </div>
      {links.length > 1 && (
        <div className="flex items-center justify-between">
          <Link href={`/parent/attendance?month=${prevParam}`} className="flex items-center gap-1 text-sm font-medium text-primary">
            <ChevronLeft aria-hidden="true" className="size-4" />
            Previous
          </Link>
          <Link href={`/parent/attendance?month=${nextParam}`} className="flex items-center gap-1 text-sm font-medium text-primary">
            Next
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      )}
      {links.length === 0 && <p className="text-sm text-muted-foreground">No children linked.</p>}
      {links.map((link) => (
        <div key={link.id} className="flex flex-col gap-2">
          {links.length > 1 && <h2 className="text-sm font-semibold text-foreground">{link.student.firstName}</h2>}
          <StudentAttendanceSummary
            studentId={link.student.id}
            monthParam={month}
            basePath={links.length === 1 ? "/parent/attendance" : undefined}
            compact={links.length > 1}
          />
        </div>
      ))}
    </div>
  );
}
