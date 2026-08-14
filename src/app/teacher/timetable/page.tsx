import { TimetablePageContent } from "@/components/shared/timetable-page-content";

export default async function TeacherTimetablePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <TimetablePageContent searchParams={searchParams} />;
}
