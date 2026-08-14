import { MarksEntryPageContent } from "@/components/shared/marks-entry-page-content";

export default async function TeacherMarksEntryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <MarksEntryPageContent searchParams={searchParams} />;
}
