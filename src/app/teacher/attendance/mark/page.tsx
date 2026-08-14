import { AttendanceMarkPageContent } from "@/components/shared/attendance-mark-page-content";

export default async function TeacherAttendanceMarkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <AttendanceMarkPageContent searchParams={searchParams} />;
}
