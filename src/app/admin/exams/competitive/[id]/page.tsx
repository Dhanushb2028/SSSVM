import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteCompetitiveExamMarkAction } from "@/server/actions/competitive-exam-actions";
import { CompetitiveMarkForm } from "./mark-form";

export default async function CompetitiveExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermissionOrRedirect("exams.competitive", "VIEW");
  const { id } = await params;
  const exam = await db.competitiveExam.findUnique({ where: { id }, include: { marks: { include: { student: true } } } });
  if (!exam) notFound();

  const students = await db.student.findMany({
    where: { status: "ACTIVE", deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
    orderBy: { firstName: "asc" },
    take: 500,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{exam.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add / update a mark</CardTitle>
        </CardHeader>
        <CardContent>
          <CompetitiveMarkForm competitiveExamId={exam.id} students={students} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marks ({exam.marks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {exam.marks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No marks entered yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Student</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Marks</th>
                    <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Remarks</th>
                    <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.marks.map((m) => (
                    <tr key={m.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">{m.student.firstName} {m.student.lastName} ({m.student.admissionNumber})</td>
                      <td className="px-3 py-2 text-right">{m.marksObtained} / {m.maxMarks}</td>
                      <td className="px-3 py-2">{m.remarks ?? "—"}</td>
                      <td className="px-3 py-2">
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="sm" aria-label="Delete mark">
                              <Trash2 aria-hidden="true" className="text-danger" />
                            </Button>
                          }
                          title="Delete mark"
                          description="Delete this mark?"
                          confirmLabel="Delete"
                          action={deleteCompetitiveExamMarkAction}
                          hiddenFields={{ id: m.id, competitiveExamId: exam.id }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
