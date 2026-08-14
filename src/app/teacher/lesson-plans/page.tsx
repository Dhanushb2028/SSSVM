import { LessonPlanPageContent } from "@/components/shared/lesson-plan-page-content";

export default async function TeacherLessonPlansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <LessonPlanPageContent searchParams={searchParams} />;
}
