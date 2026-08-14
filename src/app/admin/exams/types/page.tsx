import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamTypeForm, ExamTypeList } from "./exam-type-forms";

export default async function ExamTypesPage() {
  await requirePermissionOrRedirect("exams.types", "VIEW");
  const examTypes = await db.examType.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { exams: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Exam Types</h1>
        <p className="text-sm text-muted-foreground">e.g. Unit Test, Mid-Term, Final.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add Exam Type</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ExamTypeForm />
          <ExamTypeList items={examTypes.map((e) => ({ id: e.id, name: e.name, usageCount: e._count.exams }))} />
        </CardContent>
      </Card>
    </div>
  );
}
