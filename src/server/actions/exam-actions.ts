"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { examSchema } from "@/lib/validation/exams";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

function toData(formData: FormData) {
  let subjects: unknown = [];
  try {
    subjects = JSON.parse(String(formData.get("subjects") ?? "[]"));
  } catch {
    subjects = [];
  }
  return examSchema.safeParse({
    branchId: formData.get("branchId"),
    academicYearId: formData.get("academicYearId"),
    examTypeId: formData.get("examTypeId"),
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    includeInRank: formData.get("includeInRank") === "on",
    subjects,
  });
}

export async function createExamAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("exams.exams", "CREATE");
  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const exam = await db.exam.create({
    data: {
      branchId: parsed.data.branchId,
      academicYearId: parsed.data.academicYearId,
      examTypeId: parsed.data.examTypeId,
      name: parsed.data.name,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      includeInRank: Boolean(parsed.data.includeInRank),
      subjects: {
        create: parsed.data.subjects.map((s) => ({
          subjectId: s.subjectId,
          maxMarks: s.maxMarks,
          passMarks: s.passMarks,
          examDate: s.examDate ? new Date(s.examDate) : null,
        })),
      },
    },
  });

  await recordAudit({ actorId: session.userId, action: "exam.create", entityType: "Exam", entityId: exam.id });
  revalidatePath("/admin/exams/exams");
  redirect("/admin/exams/exams");
}

export async function updateExamAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("exams.exams", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing exam id" };

  const existing = await db.exam.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Exam not found." };
  assertBranchAccess(session, existing.branchId);

  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  await db.$transaction(async (tx) => {
    await tx.exam.update({
      where: { id },
      data: {
        branchId: parsed.data.branchId,
        academicYearId: parsed.data.academicYearId,
        examTypeId: parsed.data.examTypeId,
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        includeInRank: Boolean(parsed.data.includeInRank),
      },
    });

    const existingSubjects = await tx.examSubject.findMany({ where: { examId: id } });
    const keepSubjectIds = new Set(parsed.data.subjects.map((s) => s.subjectId));
    const toRemove = existingSubjects.filter((es) => !keepSubjectIds.has(es.subjectId));
    if (toRemove.length > 0) {
      await tx.examMark.deleteMany({ where: { examSubjectId: { in: toRemove.map((r) => r.id) } } });
      await tx.examSubject.deleteMany({ where: { id: { in: toRemove.map((r) => r.id) } } });
    }

    for (const s of parsed.data.subjects) {
      await tx.examSubject.upsert({
        where: { examId_subjectId: { examId: id, subjectId: s.subjectId } },
        create: { examId: id, subjectId: s.subjectId, maxMarks: s.maxMarks, passMarks: s.passMarks, examDate: s.examDate ? new Date(s.examDate) : null },
        update: { maxMarks: s.maxMarks, passMarks: s.passMarks, examDate: s.examDate ? new Date(s.examDate) : null },
      });
    }
  });

  await recordAudit({ actorId: session.userId, action: "exam.update", entityType: "Exam", entityId: id });
  revalidatePath("/admin/exams/exams");
  return { success: true };
}

export async function deleteExamAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("exams.exams", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing exam id" };

  const existing = await db.exam.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Exam not found." };
  assertBranchAccess(session, existing.branchId);

  const markCount = await db.examMark.count({ where: { examSubject: { examId: id } } });
  if (markCount > 0) return { error: `Cannot delete: ${markCount} mark(s) already entered for this exam.` };

  await db.$transaction([
    db.examSubject.deleteMany({ where: { examId: id } }),
    db.exam.delete({ where: { id } }),
  ]);
  await recordAudit({ actorId: session.userId, action: "exam.delete", entityType: "Exam", entityId: id });
  revalidatePath("/admin/exams/exams");
  return { success: true };
}
