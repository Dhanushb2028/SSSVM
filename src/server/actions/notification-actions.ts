"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/rbac/errors";
import { hasPermission } from "@/lib/rbac/has-permission";
import { assertBranchAccess, requireSectionActionAccess } from "@/lib/rbac/scope";
import { sendNotificationSchema } from "@/lib/validation/notifications";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function sendNotificationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const parsed = sendNotificationSchema.safeParse({
    branchId: formData.get("branchId"),
    title: formData.get("title"),
    body: formData.get("body"),
    targetType: formData.get("targetType"),
    sectionId: formData.get("sectionId"),
    studentId: formData.get("studentId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (!session) throw new ForbiddenError();

  if (parsed.data.targetType === "ALL") {
    if (session.role !== "ADMIN" || !hasPermission(session, "comms.notifications", "CREATE")) throw new ForbiddenError();
    assertBranchAccess(session, parsed.data.branchId);
  } else if (parsed.data.targetType === "SECTION") {
    if (!parsed.data.sectionId) return { error: "Select a section." };
    await requireSectionActionAccess(session, parsed.data.sectionId, "comms.notifications");
  } else {
    if (!parsed.data.sectionId || !parsed.data.studentId) return { error: "Select a student." };
    await requireSectionActionAccess(session, parsed.data.sectionId, "comms.notifications");
    const student = await db.student.findUnique({ where: { id: parsed.data.studentId }, select: { sectionId: true } });
    if (!student || student.sectionId !== parsed.data.sectionId) return { error: "That student is not in the selected section." };
  }

  const notification = await db.notification.create({
    data: {
      branchId: parsed.data.branchId,
      title: parsed.data.title,
      body: parsed.data.body,
      targetType: parsed.data.targetType,
      sectionId: parsed.data.targetType !== "ALL" ? parsed.data.sectionId || null : null,
      studentId: parsed.data.targetType === "STUDENT" ? parsed.data.studentId || null : null,
      createdByUserId: session.userId,
    },
  });

  await recordAudit({ actorId: session.userId, action: "notification.send", entityType: "Notification", entityId: notification.id });
  revalidatePath("/admin/notifications");
  revalidatePath("/teacher/notifications");
  return { success: true };
}
