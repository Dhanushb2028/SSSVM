import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { HomeworkDetailContent } from "@/components/shared/homework-detail-content";

export default async function AdminHomeworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermissionOrRedirect("homework.manage", "VIEW");
  const { id } = await params;
  return <HomeworkDetailContent id={id} />;
}
