"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireBranchActionAccess } from "@/lib/rbac/scope";
import { getSession } from "@/lib/auth/session";
import { galleryAlbumSchema, videoSchema } from "@/lib/validation/gallery";
import { getStorageProvider, StorageValidationError } from "@/lib/storage/provider";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createAlbumAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const parsed = galleryAlbumSchema.safeParse({ branchId: formData.get("branchId"), title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await requireBranchActionAccess(session, parsed.data.branchId, "comms.gallery");

  const album = await db.galleryAlbum.create({ data: parsed.data });
  await recordAudit({ actorId: session!.userId, action: "gallery_album.create", entityType: "GalleryAlbum", entityId: album.id });
  revalidatePath("/admin/gallery");
  revalidatePath("/teacher/gallery");
  return { success: true };
}

export async function deleteAlbumAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing album id" };

  const existing = await db.galleryAlbum.findUnique({ where: { id } });
  if (!existing) return { error: "Album not found." };
  await requireBranchActionAccess(session, existing.branchId, "comms.gallery");

  await db.$transaction([
    db.galleryItem.deleteMany({ where: { albumId: id } }),
    db.galleryAlbum.delete({ where: { id } }),
  ]);
  await recordAudit({ actorId: session!.userId, action: "gallery_album.delete", entityType: "GalleryAlbum", entityId: id });
  revalidatePath("/admin/gallery");
  revalidatePath("/teacher/gallery");
  return { success: true };
}

export async function addGalleryItemAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const albumId = String(formData.get("albumId") ?? "");
  const caption = String(formData.get("caption") ?? "");
  if (!albumId) return { error: "Missing album id" };

  const album = await db.galleryAlbum.findUnique({ where: { id: albumId } });
  if (!album) return { error: "Album not found." };
  await requireBranchActionAccess(session, album.branchId, "comms.gallery");

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image." };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await getStorageProvider().save({ name: file.name, mimeType: file.type, buffer }, "gallery");
    await db.galleryItem.create({ data: { albumId, imageUrl: stored.url, caption: caption || null } });
  } catch (e) {
    if (e instanceof StorageValidationError) return { error: e.message };
    throw e;
  }

  revalidatePath(`/admin/gallery/${albumId}`);
  revalidatePath(`/teacher/gallery/${albumId}`);
  return { success: true };
}

export async function createVideoAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const parsed = videoSchema.safeParse({
    branchId: formData.get("branchId"),
    title: formData.get("title"),
    videoUrl: formData.get("videoUrl"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await requireBranchActionAccess(session, parsed.data.branchId, "comms.videos");

  const video = await db.video.create({
    data: { branchId: parsed.data.branchId, title: parsed.data.title, videoUrl: parsed.data.videoUrl, description: parsed.data.description || null },
  });
  await recordAudit({ actorId: session!.userId, action: "video.create", entityType: "Video", entityId: video.id });
  revalidatePath("/admin/videos");
  revalidatePath("/teacher/videos");
  return { success: true };
}

export async function deleteVideoAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing video id" };

  const existing = await db.video.findUnique({ where: { id } });
  if (!existing) return { error: "Video not found." };
  await requireBranchActionAccess(session, existing.branchId, "comms.videos");

  await db.video.delete({ where: { id } });
  await recordAudit({ actorId: session!.userId, action: "video.delete", entityType: "Video", entityId: id });
  revalidatePath("/admin/videos");
  revalidatePath("/teacher/videos");
  return { success: true };
}
