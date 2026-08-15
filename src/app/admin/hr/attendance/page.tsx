import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { getStaffRosterWithAttendance } from "@/server/services/staff-attendance";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import { UrlDateInput } from "@/components/shared/url-date-input";
import { StaffAttendanceBoard } from "@/components/shared/staff-attendance-board";

export default async function StaffAttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("hr.attendance", "CREATE");
  const sp = await searchParams;

  const branches = await db.branch.findMany({
    where: { deletedAt: null, ...(session.branchId ? { id: session.branchId } : {}) },
    orderBy: { name: "asc" },
  });
  const branchId = (typeof sp.branchId === "string" ? sp.branchId : undefined) ?? branches[0]?.id ?? "";
  const today = new Date().toISOString().slice(0, 10);
  const date = typeof sp.date === "string" && sp.date ? sp.date : today;

  const roster = branchId ? await getStaffRosterWithAttendance(branchId, date) : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Staff Attendance / OD</h1>
        <p className="text-sm text-muted-foreground">Mark daily attendance for all active staff at a branch.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <UrlFilterSelect paramKey="branchId" placeholder="Branch" options={branches.map((b) => ({ value: b.id, label: b.name }))} />
        <UrlDateInput paramKey="date" label="Date" fallback={today} />
      </div>
      <StaffAttendanceBoard branchId={branchId} date={date} roster={roster} />
    </div>
  );
}
