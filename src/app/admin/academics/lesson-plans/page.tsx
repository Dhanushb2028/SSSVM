import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { LessonPlanPageContent } from "@/components/shared/lesson-plan-page-content";

export default async function AdminLessonPlansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("academics.lesson_plans", "EDIT");
  return <LessonPlanPageContent searchParams={searchParams} />;
}
