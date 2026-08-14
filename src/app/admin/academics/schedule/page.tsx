import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { SchedulePageContent } from "@/components/shared/schedule-page-content";

export default async function AdminSchedulePage() {
  await requirePermissionOrRedirect("academics.schedule", "VIEW");
  return <SchedulePageContent />;
}
