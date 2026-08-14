"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { organizationSchema } from "@/lib/validation/system-setup";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createOrganizationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.organizations", "CREATE");
  const parsed = organizationSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await db.organization.create({ data: { name: parsed.data.name } });
  await recordAudit({ actorId: session.userId, action: "organization.create", entityType: "Organization" });
  revalidatePath("/admin/system-setup/organizations");
  return { success: true };
}

export async function updateOrganizationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.organizations", "EDIT");
  const id = String(formData.get("id") ?? "");
  const parsed = organizationSchema.safeParse({ name: formData.get("name") });
  if (!id) return { error: "Missing organization id" };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await db.organization.update({ where: { id }, data: { name: parsed.data.name } });
  await recordAudit({ actorId: session.userId, action: "organization.update", entityType: "Organization", entityId: id });
  revalidatePath("/admin/system-setup/organizations");
  return { success: true };
}

export async function deleteOrganizationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("system.organizations", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing organization id" };

  const branchCount = await db.branch.count({ where: { organizationId: id, deletedAt: null } });
  if (branchCount > 0) {
    return { error: `Cannot delete: ${branchCount} branch(es) still belong to this organization.` };
  }

  await db.organization.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAudit({ actorId: session.userId, action: "organization.delete", entityType: "Organization", entityId: id });
  revalidatePath("/admin/system-setup/organizations");
  return { success: true };
}
