import { format } from "date-fns";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { PrintButton } from "@/app/admin/sis/id-cards/print/print-button";

export default async function HallTicketsPrintPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("exams.hall_tickets", "VIEW");
  const sp = await searchParams;
  const examId = typeof sp.examId === "string" ? sp.examId : "";
  const ids = (typeof sp.ids === "string" ? sp.ids : "").split(",").filter(Boolean);

  const [exam, students] = await Promise.all([
    db.exam.findUnique({ where: { id: examId }, include: { subjects: { include: { subject: true } }, examType: true } }),
    db.student.findMany({
      where: { id: { in: ids } },
      include: { section: { include: { course: true } }, branch: true },
    }),
  ]);

  if (!exam) return <p className="text-sm text-danger">Exam not found.</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print">
        <h1 className="text-xl font-semibold text-foreground">Hall Ticket Preview</h1>
        <p className="text-sm text-muted-foreground">{students.length} hall ticket(s) ready to print.</p>
      </div>
      <PrintButton />

      <div className="flex flex-col gap-6">
        {students.map((s) => (
          <div key={s.id} className="rounded-lg border-2 border-primary p-5" style={{ breakInside: "avoid" }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sree Siva Shankar Vidya Mandir — Hall Ticket</p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <p><strong>Student:</strong> {s.firstName} {s.lastName}</p>
              <p><strong>Admission No.:</strong> {s.admissionNumber}</p>
              <p><strong>Section:</strong> {s.section ? `${s.section.course.name} - ${s.section.name}` : "—"}</p>
              <p><strong>Branch:</strong> {s.branch.name}</p>
              <p><strong>Exam:</strong> {exam.name} ({exam.examType.name})</p>
            </div>
            <table className="mt-3 w-full min-w-[300px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-2 py-1 text-left">Subject</th>
                  <th scope="col" className="px-2 py-1 text-left">Date</th>
                  <th scope="col" className="px-2 py-1 text-left">Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {exam.subjects.map((es) => (
                  <tr key={es.id} className="border-b border-border last:border-0">
                    <td className="px-2 py-1">{es.subject.name}</td>
                    <td className="px-2 py-1">{es.examDate ? format(es.examDate, "d MMM yyyy") : "TBD"}</td>
                    <td className="px-2 py-1">{es.maxMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
