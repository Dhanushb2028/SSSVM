"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { courseSchema, subjectSchema } from "@/lib/validation/master-data";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

async function firstOrgId(): Promise<string | null> {
  const org = await db.organization.findFirst({ where: { deletedAt: null } });
  return org?.id ?? null;
}

export async function createCourseAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.master_data", "CREATE");
  const parsed = courseSchema.safeParse({ name: formData.get("name"), orderIndex: formData.get("orderIndex") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const organizationId = await firstOrgId();
  if (!organizationId) return { error: "No organization exists yet." };

  const course = await db.course.create({ data: { organizationId, ...parsed.data } });
  await recordAudit({ actorId: session.userId, action: "course.create", entityType: "Course", entityId: course.id });
  revalidatePath("/admin/system-setup/master-data");
  return { success: true };
}

export async function deleteCourseAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.master_data", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing course id" };

  const sectionCount = await db.section.count({ where: { courseId: id, deletedAt: null } });
  if (sectionCount > 0) return { error: `Cannot delete: ${sectionCount} section(s) use this course.` };

  await db.course.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAudit({ actorId: session.userId, action: "course.delete", entityType: "Course", entityId: id });
  revalidatePath("/admin/system-setup/master-data");
  return { success: true };
}

export async function createSubjectAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.master_data", "CREATE");
  const parsed = subjectSchema.safeParse({ name: formData.get("name"), code: formData.get("code") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const organizationId = await firstOrgId();
  if (!organizationId) return { error: "No organization exists yet." };

  const subject = await db.subject.create({
    data: { organizationId, name: parsed.data.name, code: parsed.data.code || null },
  });
  await recordAudit({ actorId: session.userId, action: "subject.create", entityType: "Subject", entityId: subject.id });
  revalidatePath("/admin/system-setup/master-data");
  return { success: true };
}

export async function deleteSubjectAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.master_data", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing subject id" };

  await db.subject.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAudit({ actorId: session.userId, action: "subject.delete", entityType: "Subject", entityId: id });
  revalidatePath("/admin/system-setup/master-data");
  return { success: true };
}
