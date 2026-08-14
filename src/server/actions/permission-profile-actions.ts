"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { permissionProfileSchema } from "@/lib/validation/roles";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

function toData(formData: FormData) {
  const grantValues = formData.getAll("grant").map(String);
  const grants = grantValues
    .map((v) => {
      const [module, action] = v.split("::");
      return { module, action };
    })
    .filter((g) => g.module && g.action);

  return permissionProfileSchema.safeParse({ name: formData.get("name"), grants });
}

export async function createPermissionProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("users.roles", "CREATE");
  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const profile = await db.permissionProfile.create({
    data: {
      name: parsed.data.name,
      grants: { create: parsed.data.grants.map((g) => ({ module: g.module, action: g.action as never })) },
    },
  });
  await recordAudit({ actorId: session.userId, action: "permission_profile.create", entityType: "PermissionProfile", entityId: profile.id });
  revalidatePath("/admin/users/roles");
  return { success: true };
}

export async function updatePermissionProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("users.roles", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing role id" };

  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await db.$transaction([
    db.permissionProfile.update({ where: { id }, data: { name: parsed.data.name } }),
    db.permissionGrant.deleteMany({ where: { permissionProfileId: id } }),
    db.permissionGrant.createMany({
      data: parsed.data.grants.map((g) => ({ permissionProfileId: id, module: g.module, action: g.action as never })),
    }),
  ]);

  await recordAudit({ actorId: session.userId, action: "permission_profile.update", entityType: "PermissionProfile", entityId: id });
  revalidatePath("/admin/users/roles");
  return { success: true };
}

export async function deletePermissionProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("users.roles", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing role id" };

  const existing = await db.permissionProfile.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!existing) return { error: "Role not found." };
  if (existing._count.users > 0) return { error: `Cannot delete: ${existing._count.users} user(s) are assigned this role.` };

  await db.$transaction([
    db.permissionGrant.deleteMany({ where: { permissionProfileId: id } }),
    db.permissionProfile.delete({ where: { id } }),
  ]);

  await recordAudit({ actorId: session.userId, action: "permission_profile.delete", entityType: "PermissionProfile", entityId: id });
  revalidatePath("/admin/users/roles");
  return { success: true };
}
