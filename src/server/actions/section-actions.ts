"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { sectionSchema } from "@/lib/validation/sections";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

function toData(formData: FormData) {
  return sectionSchema.safeParse({
    academicYearId: formData.get("academicYearId"),
    branchId: formData.get("branchId"),
    courseId: formData.get("courseId"),
    name: formData.get("name"),
    capacity: formData.get("capacity"),
    classTeacherId: formData.get("classTeacherId"),
  });
}

export async function createSectionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sections.manage", "CREATE");
  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const existing = await db.section.findFirst({
    where: {
      academicYearId: parsed.data.academicYearId,
      branchId: parsed.data.branchId,
      courseId: parsed.data.courseId,
      name: parsed.data.name,
      deletedAt: null,
    },
  });
  if (existing) return { error: "A section with this name already exists for that course/year/branch." };

  const section = await db.section.create({
    data: {
      academicYearId: parsed.data.academicYearId,
      branchId: parsed.data.branchId,
      courseId: parsed.data.courseId,
      name: parsed.data.name,
      capacity: parsed.data.capacity,
      classTeacherId: parsed.data.classTeacherId || null,
    },
  });
  await recordAudit({ actorId: session.userId, action: "section.create", entityType: "Section", entityId: section.id });
  revalidatePath("/admin/sections");
  return { success: true };
}

export async function updateSectionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sections.manage", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing section id" };

  const existing = await db.section.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Section not found." };
  assertBranchAccess(session, existing.branchId);

  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  await db.section.update({
    where: { id },
    data: {
      academicYearId: parsed.data.academicYearId,
      branchId: parsed.data.branchId,
      courseId: parsed.data.courseId,
      name: parsed.data.name,
      capacity: parsed.data.capacity,
      classTeacherId: parsed.data.classTeacherId || null,
    },
  });
  await recordAudit({ actorId: session.userId, action: "section.update", entityType: "Section", entityId: id });
  revalidatePath("/admin/sections");
  return { success: true };
}

export async function deleteSectionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sections.manage", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing section id" };

  const existing = await db.section.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Section not found." };
  assertBranchAccess(session, existing.branchId);

  const studentCount = await db.student.count({ where: { sectionId: id, deletedAt: null } });
  if (studentCount > 0) return { error: `Cannot delete: ${studentCount} student(s) are currently in this section.` };

  await db.section.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAudit({ actorId: session.userId, action: "section.delete", entityType: "Section", entityId: id });
  revalidatePath("/admin/sections");
  return { success: true };
}
