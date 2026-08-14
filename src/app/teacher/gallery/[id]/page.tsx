import { AlbumDetailContent } from "@/components/shared/album-detail-content";

export default async function TeacherAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AlbumDetailContent id={id} canManage />;
}
