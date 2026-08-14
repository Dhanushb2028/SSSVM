import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { NotificationsPageContent } from "@/components/shared/notifications-page-content";

export default async function AdminNotificationsPage() {
  await requirePermissionOrRedirect("comms.notifications", "VIEW");
  return <NotificationsPageContent />;
}
