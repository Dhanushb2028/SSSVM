import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { HomeworkPageContent } from "@/components/shared/homework-page-content";

export default async function AdminHomeworkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("homework.manage", "VIEW");
  return <HomeworkPageContent searchParams={searchParams} portal="admin" />;
}
