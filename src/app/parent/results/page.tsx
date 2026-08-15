import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { StudentExamResults } from "@/components/shared/student-exam-results";

export default async function ParentResultsPage() {
  const session = await getSession();
  const links = session?.guardianId
    ? await db.studentGuardian.findMany({ where: { guardianId: session.guardianId }, include: { student: true } })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Exam Results</h1>
      {links.length === 0 && <p className="text-sm text-muted-foreground">No children linked.</p>}
      {links.map((link) => (
        <div key={link.id} className="flex flex-col gap-2">
          {links.length > 1 && <h2 className="text-sm font-semibold text-foreground">{link.student.firstName}</h2>}
          <StudentExamResults studentId={link.student.id} />
        </div>
      ))}
    </div>
  );
}
