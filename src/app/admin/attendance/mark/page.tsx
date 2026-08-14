import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { AttendanceMarkPageContent } from "@/components/shared/attendance-mark-page-content";

export default async function AdminAttendanceMarkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("attendance.mark", "CREATE");
  return <AttendanceMarkPageContent searchParams={searchParams} />;
}
