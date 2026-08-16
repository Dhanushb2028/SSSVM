"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { requireSectionActionAccess } from "@/lib/rbac/scope";
import { syllabusTopicSchema } from "@/lib/validation/syllabus";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

function toData(formData: FormData) {
  return syllabusTopicSchema.safeParse({
    sectionId: formData.get("sectionId"),
    subjectId: formData.get("subjectId"),
    topic: formData.get("topic"),
    description: formData.get("description"),
    plannedDate: formData.get("plannedDate"),
    completedDate: formData.get("completedDate"),
  });
}

export async function createSyllabusTopicAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await requireSectionActionAccess(session, parsed.data.sectionId, "academics.syllabus");

  const topic = await db.syllabusTopic.create({
    data: {
      sectionId: parsed.data.sectionId,
      subjectId: parsed.data.subjectId,
      topic: parsed.data.topic,
      description: parsed.data.description || null,
      plannedDate: new Date(parsed.data.plannedDate),
      completedDate: parsed.data.completedDate ? new Date(parsed.data.completedDate) : null,
    },
  });
  await recordAudit({ actorId: session!.userId, action: "syllabus_topic.create", entityType: "SyllabusTopic", entityId: topic.id });
  revalidatePath("/admin/academics/syllabus");
  revalidatePath("/teacher/syllabus");
  return { success: true };
}

export async function updateSyllabusTopicAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing topic id" };
  const existing = await db.syllabusTopic.findUnique({ where: { id }, select: { sectionId: true } });
  if (!existing) return { error: "Topic not found." };
  await requireSectionActionAccess(session, existing.sectionId, "academics.syllabus");

  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (parsed.data.sectionId !== existing.sectionId) {
    await requireSectionActionAccess(session, parsed.data.sectionId, "academics.syllabus");
  }

  await db.syllabusTopic.update({
    where: { id },
    data: {
      subjectId: parsed.data.subjectId,
      topic: parsed.data.topic,
      description: parsed.data.description || null,
      plannedDate: new Date(parsed.data.plannedDate),
      completedDate: parsed.data.completedDate ? new Date(parsed.data.completedDate) : null,
    },
  });
  await recordAudit({ actorId: session!.userId, action: "syllabus_topic.update", entityType: "SyllabusTopic", entityId: id });
  revalidatePath("/admin/academics/syllabus");
  revalidatePath("/teacher/syllabus");
  return { success: true };
}

export async function deleteSyllabusTopicAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing topic id" };

  const existing = await db.syllabusTopic.findUnique({ where: { id }, select: { sectionId: true } });
  if (!existing) return { error: "Topic not found." };
  await requireSectionActionAccess(session, existing.sectionId, "academics.syllabus");

  await db.syllabusTopic.delete({ where: { id } });
  await recordAudit({ actorId: session!.userId, action: "syllabus_topic.delete", entityType: "SyllabusTopic", entityId: id });
  revalidatePath("/admin/academics/syllabus");
  revalidatePath("/teacher/syllabus");
  return { success: true };
}
