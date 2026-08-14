import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { CircularsPageContent } from "@/components/shared/circulars-page-content";

export default async function AdminCircularsPage() {
  await requirePermissionOrRedirect("comms.circulars", "VIEW");
  return <CircularsPageContent />;
}
