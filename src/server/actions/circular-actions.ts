"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { requireBranchActionAccess, requireSectionActionAccess } from "@/lib/rbac/scope";
import { circularSchema } from "@/lib/validation/circular";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createCircularAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const parsed = circularSchema.safeParse({
    branchId: formData.get("branchId"),
    title: formData.get("title"),
    body: formData.get("body"),
    sectionId: formData.get("sectionId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  if (parsed.data.sectionId) {
    await requireSectionActionAccess(session, parsed.data.sectionId, "comms.circulars");
  } else {
    await requireBranchActionAccess(session, parsed.data.branchId, "comms.circulars");
  }

  const circular = await db.circular.create({
    data: {
      branchId: parsed.data.branchId,
      title: parsed.data.title,
      body: parsed.data.body,
      sectionId: parsed.data.sectionId || null,
      createdByUserId: session!.userId,
    },
  });
  await recordAudit({ actorId: session!.userId, action: "circular.create", entityType: "Circular", entityId: circular.id });
  revalidatePath("/admin/circulars");
  revalidatePath("/teacher/circulars");
  return { success: true };
}

export async function deleteCircularAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing circular id" };

  const existing = await db.circular.findUnique({ where: { id } });
  if (!existing) return { error: "Circular not found." };

  if (existing.sectionId) {
    await requireSectionActionAccess(session, existing.sectionId, "comms.circulars");
  } else {
    await requireBranchActionAccess(session, existing.branchId, "comms.circulars");
  }

  await db.circular.delete({ where: { id } });
  await recordAudit({ actorId: session!.userId, action: "circular.delete", entityType: "Circular", entityId: id });
  revalidatePath("/admin/circulars");
  revalidatePath("/teacher/circulars");
  return { success: true };
}
