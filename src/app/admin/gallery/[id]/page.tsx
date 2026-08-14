import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { AlbumDetailContent } from "@/components/shared/album-detail-content";

export default async function AdminAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermissionOrRedirect("comms.gallery", "VIEW");
  const { id } = await params;
  return <AlbumDetailContent id={id} canManage />;
}
