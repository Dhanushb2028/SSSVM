"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { requireSectionActionAccess } from "@/lib/rbac/scope";
import { ForbiddenError } from "@/lib/rbac/errors";
import { homeworkSchema } from "@/lib/validation/homework";
import { recordAudit } from "@/server/services/audit";
import { getStorageProvider, StorageValidationError } from "@/lib/storage/provider";

type FormState = { error?: string; success?: boolean };

export async function createHomeworkAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const parsed = homeworkSchema.safeParse({
    sectionId: formData.get("sectionId"),
    subjectId: formData.get("subjectId"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await requireSectionActionAccess(session, parsed.data.sectionId, "homework.manage");

  const homework = await db.homework.create({
    data: {
      sectionId: parsed.data.sectionId,
      subjectId: parsed.data.subjectId,
      description: parsed.data.description,
      dueDate: new Date(parsed.data.dueDate),
      createdByUserId: session!.userId,
    },
  });

  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of files) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stored = await getStorageProvider().save({ name: file.name, mimeType: file.type, buffer }, "homework");
      await db.homeworkAttachment.create({ data: { homeworkId: homework.id, url: stored.url, fileName: file.name } });
    } catch (e) {
      if (!(e instanceof StorageValidationError)) throw e;
    }
  }

  await recordAudit({ actorId: session!.userId, action: "homework.create", entityType: "Homework", entityId: homework.id });
  revalidatePath("/admin/homework");
  revalidatePath("/teacher/homework");
  return { success: true };
}

export async function deleteHomeworkAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing homework id" };

  const existing = await db.homework.findUnique({ where: { id }, select: { sectionId: true } });
  if (!existing) return { error: "Homework not found." };
  await requireSectionActionAccess(session, existing.sectionId, "homework.manage");

  await db.$transaction([
    db.homeworkSubmission.deleteMany({ where: { homeworkId: id } }),
    db.homeworkAttachment.deleteMany({ where: { homeworkId: id } }),
    db.homework.delete({ where: { id } }),
  ]);
  await recordAudit({ actorId: session!.userId, action: "homework.delete", entityType: "Homework", entityId: id });
  revalidatePath("/admin/homework");
  revalidatePath("/teacher/homework");
  return { success: true };
}

export async function submitHomeworkAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== "STUDENT" || !session.studentId) throw new ForbiddenError();

  const homeworkId = String(formData.get("homeworkId") ?? "");
  const remarks = String(formData.get("remarks") ?? "");
  if (!homeworkId) return { error: "Missing homework id" };

  const homework = await db.homework.findUnique({ where: { id: homeworkId } });
  if (!homework) return { error: "Homework not found." };

  const student = await db.student.findUnique({ where: { id: session.studentId } });
  if (!student || student.sectionId !== homework.sectionId) throw new ForbiddenError("Not your homework");

  let attachmentUrl: string | undefined;
  const file = formData.get("attachment");
  if (file instanceof File && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stored = await getStorageProvider().save({ name: file.name, mimeType: file.type, buffer }, "homework-submissions");
      attachmentUrl = stored.url;
    } catch (e) {
      if (e instanceof StorageValidationError) return { error: e.message };
      throw e;
    }
  }

  const isLate = new Date() > homework.dueDate;
  await db.homeworkSubmission.upsert({
    where: { homeworkId_studentId: { homeworkId, studentId: session.studentId } },
    create: {
      homeworkId,
      studentId: session.studentId,
      attachmentUrl,
      remarks: remarks || null,
      status: isLate ? "LATE" : "SUBMITTED",
    },
    update: { attachmentUrl, remarks: remarks || null, submittedAt: new Date(), status: isLate ? "LATE" : "SUBMITTED" },
  });

  await recordAudit({ actorId: session.userId, action: "homework.submit", entityType: "Homework", entityId: homeworkId });
  revalidatePath("/student/homework");
  return { success: true };
}
