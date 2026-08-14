import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { TimetablePageContent } from "@/components/shared/timetable-page-content";

export default async function AdminTimetablePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("academics.timetable", "EDIT");
  return <TimetablePageContent searchParams={searchParams} />;
}
