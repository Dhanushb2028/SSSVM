"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/rbac/errors";
import { hasPermission } from "@/lib/rbac/has-permission";
import { assertBranchAccess, assertOwnStudent, getTeacherSectionIds } from "@/lib/rbac/scope";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

async function assertChatAccess(session: NonNullable<Awaited<ReturnType<typeof getSession>>>, studentId: string) {
  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student) throw new ForbiddenError("Student not found");

  if (session.role === "ADMIN") {
    if (!hasPermission(session, "comms.chat", "CREATE") && !hasPermission(session, "comms.chat", "VIEW")) throw new ForbiddenError();
    assertBranchAccess(session, student.branchId);
    return;
  }
  if (session.role === "TEACHER") {
    const sectionIds = await getTeacherSectionIds(session);
    if (!student.sectionId || !sectionIds.includes(student.sectionId)) throw new ForbiddenError("Not your student");
    return;
  }
  // STUDENT / PARENT
  await assertOwnStudent(session, studentId);
}

export async function sendChatMessageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) throw new ForbiddenError();

  const studentId = String(formData.get("studentId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!studentId || !body) return { error: "Message can't be empty." };

  await assertChatAccess(session, studentId);

  const thread = await db.chatThread.upsert({
    where: { studentId },
    create: { studentId },
    update: {},
  });

  await db.chatMessage.create({ data: { threadId: thread.id, senderUserId: session.userId, body } });
  await recordAudit({ actorId: session.userId, action: "chat.message_sent", entityType: "ChatThread", entityId: thread.id });

  revalidatePath(`/admin/chat/${studentId}`);
  revalidatePath(`/teacher/chat/${studentId}`);
  revalidatePath("/student/messages");
  revalidatePath("/parent/messages");
  return { success: true };
}
