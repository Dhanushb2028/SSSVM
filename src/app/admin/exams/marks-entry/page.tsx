import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { MarksEntryPageContent } from "@/components/shared/marks-entry-page-content";

export default async function AdminMarksEntryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("exams.marks", "CREATE");
  return <MarksEntryPageContent searchParams={searchParams} />;
}
