import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { listExamPickerData } from "@/server/services/exams";
import { ExamForm } from "../exam-form";

export default async function NewExamPage() {
  const session = await requirePermissionOrRedirect("exams.exams", "CREATE");
  const picker = await listExamPickerData(session.branchId);

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Add Exam</h1>
      </div>
      <ExamForm mode="create" picker={picker} />
    </div>
  );
}
