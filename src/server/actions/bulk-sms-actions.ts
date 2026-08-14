"use server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { bulkSmsSchema } from "@/lib/validation/bulk-sms";
import { getNotificationProvider } from "@/lib/notifications/provider";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean; sentCount?: number };

export async function sendBulkSmsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("comms.sms", "CREATE");
  const parsed = bulkSmsSchema.safeParse({
    branchId: formData.get("branchId"),
    targetType: formData.get("targetType"),
    courseId: formData.get("courseId"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const students = await db.student.findMany({
    where: {
      branchId: parsed.data.branchId,
      status: "ACTIVE",
      deletedAt: null,
      ...(parsed.data.targetType === "COURSE" && parsed.data.courseId ? { section: { courseId: parsed.data.courseId } } : {}),
    },
    include: { guardians: { include: { guardian: true } } },
  });

  const phones = new Set<string>();
  for (const s of students) for (const g of s.guardians) phones.add(g.guardian.phone);

  const provider = getNotificationProvider();
  let sentCount = 0;
  for (const phone of phones) {
    const result = await provider.sendSms({ to: phone, body: parsed.data.message });
    if (result.ok) sentCount += 1;
  }

  await recordAudit({
    actorId: session.userId,
    action: "bulk_sms.send",
    entityType: "Branch",
    entityId: parsed.data.branchId,
    metadata: { targetType: parsed.data.targetType, courseId: parsed.data.courseId, recipientCount: phones.size, sentCount },
  });

  return { success: true, sentCount };
}
