import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { VideosPageContent } from "@/components/shared/videos-page-content";

export default async function AdminVideosPage() {
  await requirePermissionOrRedirect("comms.videos", "VIEW");
  return <VideosPageContent portal="admin" />;
}
