"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { hashPassword } from "@/lib/auth/password";
import { destroyAllSessionsForUser } from "@/lib/auth/session";
import { createAdminUserSchema, updateAdminUserSchema, resetPasswordSchema } from "@/lib/validation/users";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createAdminUserAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("users.accounts", "CREATE");
  const parsed = createAdminUserSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    name: formData.get("name"),
    email: formData.get("email"),
    branchId: formData.get("branchId"),
    permissionProfileId: formData.get("permissionProfileId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const existing = await db.user.findUnique({ where: { username: parsed.data.username } });
  if (existing) return { error: "That username is already taken." };

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: {
      role: "ADMIN",
      username: parsed.data.username,
      name: parsed.data.name,
      email: parsed.data.email || null,
      passwordHash,
      branchId: parsed.data.branchId || null,
      permissionProfileId: parsed.data.permissionProfileId || null,
    },
  });

  await recordAudit({ actorId: session.userId, action: "user.create", entityType: "User", entityId: user.id });
  revalidatePath("/admin/users/accounts");
  return { success: true };
}

export async function updateAdminUserAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("users.accounts", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing user id" };

  const parsed = updateAdminUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    branchId: formData.get("branchId"),
    permissionProfileId: formData.get("permissionProfileId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await db.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email || null,
      branchId: parsed.data.branchId || null,
      permissionProfileId: parsed.data.permissionProfileId || null,
    },
  });

  await recordAudit({ actorId: session.userId, action: "user.update", entityType: "User", entityId: id });
  revalidatePath("/admin/users/accounts");
  return { success: true };
}

export async function toggleUserActiveAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("users.accounts", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing user id" };
  if (id === session.userId) return { error: "You can't deactivate your own account." };

  const target = await db.user.findUnique({ where: { id } });
  if (!target) return { error: "User not found." };

  const nextActive = !target.isActive;
  await db.user.update({ where: { id }, data: { isActive: nextActive } });
  if (!nextActive) await destroyAllSessionsForUser(id);

  await recordAudit({
    actorId: session.userId,
    action: nextActive ? "user.activate" : "user.deactivate",
    entityType: "User",
    entityId: id,
  });
  revalidatePath("/admin/users/accounts");
  return { success: true };
}

export async function resetUserPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("users.accounts", "EDIT");
  const id = String(formData.get("id") ?? "");
  const parsed = resetPasswordSchema.safeParse({ newPassword: formData.get("newPassword") });
  if (!id) return { error: "Missing user id" };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.user.update({ where: { id }, data: { passwordHash } });
  await destroyAllSessionsForUser(id);

  await recordAudit({ actorId: session.userId, action: "user.reset_password", entityType: "User", entityId: id });
  revalidatePath("/admin/users/accounts");
  return { success: true };
}
