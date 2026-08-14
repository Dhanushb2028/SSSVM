import { SyllabusPageContent } from "@/components/shared/syllabus-page-content";

export default async function TeacherSyllabusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SyllabusPageContent searchParams={searchParams} />;
}
