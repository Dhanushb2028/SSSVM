import { HomeworkPageContent } from "@/components/shared/homework-page-content";

export default async function TeacherHomeworkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <HomeworkPageContent searchParams={searchParams} portal="teacher" />;
}
