"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { meoSchema } from "@/lib/validation/admissions";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createMeoAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("admissions.meo", "CREATE");
  const parsed = meoSchema.safeParse({
    branchId: formData.get("branchId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const meo = await db.marketingOfficer.create({
    data: { ...parsed.data, email: parsed.data.email || null },
  });
  await recordAudit({ actorId: session.userId, action: "meo.create", entityType: "MarketingOfficer", entityId: meo.id });
  revalidatePath("/admin/admissions/meo");
  return { success: true };
}

export async function deleteMeoAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("admissions.meo", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id" };

  const existing = await db.marketingOfficer.findUnique({ where: { id } });
  if (!existing) return { error: "Not found." };
  assertBranchAccess(session, existing.branchId);

  await db.marketingOfficer.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAudit({ actorId: session.userId, action: "meo.delete", entityType: "MarketingOfficer", entityId: id });
  revalidatePath("/admin/admissions/meo");
  return { success: true };
}
