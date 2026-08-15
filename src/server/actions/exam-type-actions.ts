"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { examTypeSchema } from "@/lib/validation/exams";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createExamTypeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("exams.types", "CREATE");
  const parsed = examTypeSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const org = await db.organization.findFirst({ where: { deletedAt: null } });
  if (!org) return { error: "No organization exists yet." };

  const existing = await db.examType.findFirst({ where: { organizationId: org.id, name: parsed.data.name } });
  if (existing) return { error: "An exam type with this name already exists." };

  const examType = await db.examType.create({ data: { organizationId: org.id, name: parsed.data.name } });
  await recordAudit({ actorId: session.userId, action: "exam_type.create", entityType: "ExamType", entityId: examType.id });
  revalidatePath("/admin/exams/types");
  return { success: true };
}

export async function deleteExamTypeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("exams.types", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing exam type id" };

  const examCount = await db.exam.count({ where: { examTypeId: id, deletedAt: null } });
  if (examCount > 0) return { error: `Cannot delete: ${examCount} exam(s) use this type.` };

  await db.examType.delete({ where: { id } });
  await recordAudit({ actorId: session.userId, action: "exam_type.delete", entityType: "ExamType", entityId: id });
  revalidatePath("/admin/exams/types");
  return { success: true };
}
