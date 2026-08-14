"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

function parseStudentIds(formData: FormData): string[] {
  try {
    const raw = JSON.parse(String(formData.get("studentIds") ?? "[]"));
    return Array.isArray(raw) ? raw.map(String) : [];
  } catch {
    return [];
  }
}

export async function promoteStudentsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.promote", "EDIT");
  const targetSectionId = String(formData.get("targetSectionId") ?? "");
  const studentIds = parseStudentIds(formData);

  if (!targetSectionId) return { error: "Select a target section." };
  if (studentIds.length === 0) return { error: "Select at least one student to promote." };

  const targetSection = await db.section.findUnique({ where: { id: targetSectionId } });
  if (!targetSection) return { error: "Target section not found." };
  assertBranchAccess(session, targetSection.branchId);

  const students = await db.student.findMany({ where: { id: { in: studentIds } }, select: { id: true, branchId: true } });
  for (const s of students) assertBranchAccess(session, s.branchId);

  await db.student.updateMany({
    where: { id: { in: studentIds } },
    data: { sectionId: targetSectionId, status: "ACTIVE" },
  });

  await recordAudit({
    actorId: session.userId,
    action: "student.bulk_promote",
    entityType: "Section",
    entityId: targetSectionId,
    metadata: { studentCount: studentIds.length, studentIds },
  });

  revalidatePath("/admin/sis/promote");
  revalidatePath("/admin/sis/students");
  return { success: true };
}

export async function changeStudentSectionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.section_change", "EDIT");
  const targetSectionId = String(formData.get("targetSectionId") ?? "");
  const studentIds = parseStudentIds(formData);

  if (!targetSectionId) return { error: "Select a target section." };
  if (studentIds.length === 0) return { error: "Select at least one student to move." };

  const targetSection = await db.section.findUnique({ where: { id: targetSectionId } });
  if (!targetSection) return { error: "Target section not found." };
  assertBranchAccess(session, targetSection.branchId);

  const students = await db.student.findMany({ where: { id: { in: studentIds } }, select: { id: true, branchId: true } });
  for (const s of students) assertBranchAccess(session, s.branchId);

  await db.student.updateMany({ where: { id: { in: studentIds } }, data: { sectionId: targetSectionId } });

  await recordAudit({
    actorId: session.userId,
    action: "student.bulk_section_change",
    entityType: "Section",
    entityId: targetSectionId,
    metadata: { studentCount: studentIds.length, studentIds },
  });

  revalidatePath("/admin/sis/section-change");
  revalidatePath("/admin/sis/students");
  return { success: true };
}
