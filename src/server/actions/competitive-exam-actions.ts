"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { competitiveExamSchema, competitiveExamMarkSchema } from "@/lib/validation/competitive-exam";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createCompetitiveExamAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("exams.competitive", "CREATE");
  const parsed = competitiveExamSchema.safeParse({ name: formData.get("name"), examDate: formData.get("examDate") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const org = await db.organization.findFirst({ where: { deletedAt: null } });
  if (!org) return { error: "No organization exists yet." };

  const exam = await db.competitiveExam.create({
    data: { organizationId: org.id, name: parsed.data.name, examDate: parsed.data.examDate ? new Date(parsed.data.examDate) : null },
  });
  await recordAudit({ actorId: session.userId, action: "competitive_exam.create", entityType: "CompetitiveExam", entityId: exam.id });
  revalidatePath("/admin/exams/competitive");
  return { success: true };
}

export async function deleteCompetitiveExamAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("exams.competitive", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id" };

  await db.$transaction([
    db.competitiveExamMark.deleteMany({ where: { competitiveExamId: id } }),
    db.competitiveExam.delete({ where: { id } }),
  ]);
  await recordAudit({ actorId: session.userId, action: "competitive_exam.delete", entityType: "CompetitiveExam", entityId: id });
  revalidatePath("/admin/exams/competitive");
  return { success: true };
}

export async function addCompetitiveExamMarkAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("exams.competitive", "CREATE");
  const parsed = competitiveExamMarkSchema.safeParse({
    competitiveExamId: formData.get("competitiveExamId"),
    studentId: formData.get("studentId"),
    marksObtained: formData.get("marksObtained"),
    maxMarks: formData.get("maxMarks"),
    remarks: formData.get("remarks"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const mark = await db.competitiveExamMark.upsert({
    where: { competitiveExamId_studentId: { competitiveExamId: parsed.data.competitiveExamId, studentId: parsed.data.studentId } },
    create: parsed.data,
    update: { marksObtained: parsed.data.marksObtained, maxMarks: parsed.data.maxMarks, remarks: parsed.data.remarks || null },
  });
  await recordAudit({ actorId: session.userId, action: "competitive_exam_mark.save", entityType: "CompetitiveExamMark", entityId: mark.id });
  revalidatePath(`/admin/exams/competitive/${parsed.data.competitiveExamId}`);
  return { success: true };
}

export async function deleteCompetitiveExamMarkAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("exams.competitive", "DELETE");
  const id = String(formData.get("id") ?? "");
  const competitiveExamId = String(formData.get("competitiveExamId") ?? "");
  if (!id) return { error: "Missing id" };

  await db.competitiveExamMark.delete({ where: { id } });
  await recordAudit({ actorId: session.userId, action: "competitive_exam_mark.delete", entityType: "CompetitiveExamMark", entityId: id });
  revalidatePath(`/admin/exams/competitive/${competitiveExamId}`);
  return { success: true };
}
