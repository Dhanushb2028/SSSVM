import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { GalleryPageContent } from "@/components/shared/gallery-page-content";

export default async function AdminGalleryPage() {
  await requirePermissionOrRedirect("comms.gallery", "VIEW");
  return <GalleryPageContent portal="admin" />;
}
