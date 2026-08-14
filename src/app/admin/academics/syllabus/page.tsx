import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { SyllabusPageContent } from "@/components/shared/syllabus-page-content";

export default async function AdminSyllabusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("academics.syllabus", "EDIT");
  return <SyllabusPageContent searchParams={searchParams} />;
}
