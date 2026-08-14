import { getSession } from "@/lib/auth/session";
import { getRosterWithAttendance } from "@/server/services/attendance";
import { listActionableSections } from "@/server/services/section-scope";
import { SectionPickerSelect } from "@/components/shared/section-picker-select";
import { UrlDateInput } from "@/components/shared/url-date-input";
import { AttendanceMarkBoard } from "@/components/shared/attendance-mark-board";

export async function AttendanceMarkPageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const sectionId = typeof sp.sectionId === "string" ? sp.sectionId : undefined;
  const today = new Date().toISOString().slice(0, 10);
  const date = typeof sp.date === "string" && sp.date ? sp.date : today;

  const sections = session ? await listActionableSections(session) : [];
  const roster = sectionId ? await getRosterWithAttendance(sectionId, date) : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Mark Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Pick a section and a date (past or future), mark each student, then save.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <SectionPickerSelect paramKey="sectionId" label="Select section" sections={sections} />
        <UrlDateInput paramKey="date" label="Date" fallback={today} />
      </div>
      <AttendanceMarkBoard sectionId={sectionId ?? ""} date={date} roster={roster} />
    </div>
  );
}
