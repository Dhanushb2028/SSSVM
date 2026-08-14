"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { bannerSchema } from "@/lib/validation/banners";
import { getStorageProvider, StorageValidationError } from "@/lib/storage/provider";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

function toData(formData: FormData) {
  return bannerSchema.safeParse({
    branchId: formData.get("branchId"),
    title: formData.get("title"),
    linkUrl: formData.get("linkUrl"),
    orderIndex: formData.get("orderIndex") || 0,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createBannerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.app_banners", "CREATE");
  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a banner image." };

  let imageUrl: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await getStorageProvider().save({ name: file.name, mimeType: file.type, buffer }, "banners");
    imageUrl = stored.url;
  } catch (e) {
    if (e instanceof StorageValidationError) return { error: e.message };
    throw e;
  }

  const banner = await db.appBanner.create({
    data: {
      branchId: parsed.data.branchId,
      title: parsed.data.title || null,
      linkUrl: parsed.data.linkUrl || null,
      orderIndex: parsed.data.orderIndex,
      isActive: parsed.data.isActive ?? true,
      imageUrl,
    },
  });
  await recordAudit({ actorId: session.userId, action: "app_banner.create", entityType: "AppBanner", entityId: banner.id });
  revalidatePath("/admin/sis/banners");
  return { success: true };
}

export async function toggleBannerActiveAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.app_banners", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing banner id" };

  const existing = await db.appBanner.findUnique({ where: { id } });
  if (!existing) return { error: "Banner not found." };
  assertBranchAccess(session, existing.branchId);

  await db.appBanner.update({ where: { id }, data: { isActive: !existing.isActive } });
  await recordAudit({ actorId: session.userId, action: "app_banner.toggle", entityType: "AppBanner", entityId: id });
  revalidatePath("/admin/sis/banners");
  return { success: true };
}

export async function deleteBannerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.app_banners", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing banner id" };

  const existing = await db.appBanner.findUnique({ where: { id } });
  if (!existing) return { error: "Banner not found." };
  assertBranchAccess(session, existing.branchId);

  await db.appBanner.delete({ where: { id } });
  await recordAudit({ actorId: session.userId, action: "app_banner.delete", entityType: "AppBanner", entityId: id });
  revalidatePath("/admin/sis/banners");
  return { success: true };
}
