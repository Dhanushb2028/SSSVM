import { getSession } from "@/lib/auth/session";
import { StudentExamResults } from "@/components/shared/student-exam-results";

export default async function StudentResultsPage() {
  const session = await getSession();

  if (!session?.studentId) {
    return <p className="text-sm text-muted-foreground">Your student profile hasn&apos;t been linked yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Exam Results</h1>
      <StudentExamResults studentId={session.studentId} />
    </div>
  );
}
