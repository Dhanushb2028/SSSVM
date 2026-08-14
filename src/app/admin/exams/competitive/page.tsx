import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetitiveExamForm, CompetitiveExamList } from "./competitive-exam-forms";

export default async function CompetitiveExamsPage() {
  await requirePermissionOrRedirect("exams.competitive", "VIEW");
  const exams = await db.competitiveExam.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { marks: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Competitive Exam Marks</h1>
        <p className="text-sm text-muted-foreground">Marks for external competitive exams (e.g. NEET-style), separate from school exams.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add Competitive Exam</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <CompetitiveExamForm />
          <CompetitiveExamList items={exams.map((e) => ({ id: e.id, name: e.name, markCount: e._count.marks }))} />
        </CardContent>
      </Card>
    </div>
  );
}
