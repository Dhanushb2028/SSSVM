"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { academicYearSchema } from "@/lib/validation/system-setup";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

function toData(formData: FormData) {
  return academicYearSchema.safeParse({
    branchId: formData.get("branchId"),
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isCurrent: formData.get("isCurrent") === "on",
  });
}

async function setAsCurrentIfRequested(branchId: string, yearId: string, isCurrent: boolean) {
  if (!isCurrent) return;
  await db.$transaction([
    db.academicYear.updateMany({ where: { branchId, NOT: { id: yearId } }, data: { isCurrent: false } }),
    db.academicYear.update({ where: { id: yearId }, data: { isCurrent: true } }),
  ]);
}

export async function createAcademicYearAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.academic_years", "CREATE");
  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const year = await db.academicYear.create({
    data: {
      branchId: parsed.data.branchId,
      name: parsed.data.name,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      isCurrent: false,
    },
  });
  await setAsCurrentIfRequested(parsed.data.branchId, year.id, Boolean(parsed.data.isCurrent));

  await recordAudit({ actorId: session.userId, action: "academic_year.create", entityType: "AcademicYear", entityId: year.id });
  revalidatePath("/admin/system-setup/academic-years");
  return { success: true };
}

export async function updateAcademicYearAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.academic_years", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing academic year id" };

  const existing = await db.academicYear.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Academic year not found." };
  assertBranchAccess(session, existing.branchId);

  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  await db.academicYear.update({
    where: { id },
    data: {
      branchId: parsed.data.branchId,
      name: parsed.data.name,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    },
  });
  await setAsCurrentIfRequested(parsed.data.branchId, id, Boolean(parsed.data.isCurrent));

  await recordAudit({ actorId: session.userId, action: "academic_year.update", entityType: "AcademicYear", entityId: id });
  revalidatePath("/admin/system-setup/academic-years");
  return { success: true };
}

export async function deleteAcademicYearAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.academic_years", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing academic year id" };

  const existing = await db.academicYear.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Academic year not found." };
  assertBranchAccess(session, existing.branchId);

  const sectionCount = await db.section.count({ where: { academicYearId: id, deletedAt: null } });
  if (sectionCount > 0) {
    return { error: "Cannot delete: this academic year still has sections mapped to it." };
  }

  await db.academicYear.delete({ where: { id } });
  await recordAudit({ actorId: session.userId, action: "academic_year.delete", entityType: "AcademicYear", entityId: id });
  revalidatePath("/admin/system-setup/academic-years");
  return { success: true };
}
