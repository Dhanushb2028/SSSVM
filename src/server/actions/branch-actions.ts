"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { branchSchema } from "@/lib/validation/system-setup";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

function toData(formData: FormData) {
  return branchSchema.safeParse({
    organizationId: formData.get("organizationId"),
    name: formData.get("name"),
    city: formData.get("city"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    isHostel: formData.get("isHostel") === "on",
  });
}

export async function createBranchAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.branches", "CREATE");
  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const branch = await db.branch.create({ data: parsed.data });
  await recordAudit({ actorId: session.userId, action: "branch.create", entityType: "Branch", entityId: branch.id });
  revalidatePath("/admin/system-setup/branches");
  return { success: true };
}

export async function updateBranchAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.branches", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing branch id" };
  assertBranchAccess(session, id);

  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await db.branch.update({ where: { id }, data: parsed.data });
  await recordAudit({ actorId: session.userId, action: "branch.update", entityType: "Branch", entityId: id });
  revalidatePath("/admin/system-setup/branches");
  return { success: true };
}

export async function deleteBranchAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.branches", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing branch id" };
  assertBranchAccess(session, id);

  const [sectionCount, studentCount, yearCount] = await Promise.all([
    db.section.count({ where: { branchId: id, deletedAt: null } }),
    db.student.count({ where: { branchId: id, deletedAt: null } }),
    db.academicYear.count({ where: { branchId: id } }),
  ]);
  if (sectionCount + studentCount + yearCount > 0) {
    return { error: "Cannot delete: this branch still has sections, students, or academic years." };
  }

  const existing = await db.branch.findUnique({ where: { id } });
  if (!existing) return { error: "Branch not found." };

  await db.branch.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAudit({ actorId: session.userId, action: "branch.delete", entityType: "Branch", entityId: id });
  revalidatePath("/admin/system-setup/branches");
  return { success: true };
}
