"use server";

import { requirePermission } from "@/lib/rbac/permissions";
import { getNotificationProvider } from "@/lib/notifications/provider";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function sendBirthdayWishAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.birthdays", "CREATE");
  const phone = String(formData.get("phone") ?? "");
  const firstName = String(formData.get("firstName") ?? "");
  const studentId = String(formData.get("studentId") ?? "");

  if (!phone) return { error: "This student has no contact phone on file." };

  await getNotificationProvider().sendSms({
    to: phone,
    body: `Happy Birthday, ${firstName}! Wishing you a wonderful year ahead. — Sree Siva Shankar Vidya Mandir`,
  });

  await recordAudit({ actorId: session.userId, action: "student.birthday_wish_sent", entityType: "Student", entityId: studentId });
  return { success: true };
}
