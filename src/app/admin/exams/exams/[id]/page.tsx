import { notFound } from "next/navigation";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { getExamDetail, listExamPickerData } from "@/server/services/exams";
import { ExamForm } from "../exam-form";

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermissionOrRedirect("exams.exams", "EDIT");
  const { id } = await params;
  const exam = await getExamDetail(id);
  if (!exam) notFound();
  assertBranchAccess(session, exam.branchId);

  const picker = await listExamPickerData(session.branchId);

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit Exam</h1>
      </div>
      <ExamForm mode="edit" picker={picker} exam={exam} />
    </div>
  );
}
