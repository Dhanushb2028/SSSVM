"use server";

import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { getFeeDueReport } from "@/server/services/fees";
import { getNotificationProvider } from "@/lib/notifications/provider";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean; sentCount?: number };

export async function sendFeeDueSmsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("finance.reports", "CREATE");
  const branchId = String(formData.get("branchId") ?? "");
  const academicYearId = String(formData.get("academicYearId") ?? "");
  if (!branchId || !academicYearId) return { error: "Missing branch or academic year." };
  assertBranchAccess(session, branchId);

  const due = await getFeeDueReport(branchId, academicYearId);
  const withBalance = due.filter((r) => r.balance > 0);

  const students = await db.student.findMany({
    where: { id: { in: withBalance.map((r) => r.student.id) } },
    include: { guardians: { include: { guardian: true } } },
  });

  const provider = getNotificationProvider();
  let sentCount = 0;
  for (const student of students) {
    const row = withBalance.find((r) => r.student.id === student.id);
    if (!row) continue;
    for (const link of student.guardians) {
      const result = await provider.sendSms({
        to: link.guardian.phone,
        body: `Dear parent, ${student.firstName}'s fee balance is ₹${row.balance}. Please pay at the earliest. — SSSVM`,
      });
      if (result.ok) sentCount += 1;
    }
  }

  await recordAudit({
    actorId: session.userId,
    action: "fee_due_sms.send",
    entityType: "Branch",
    entityId: branchId,
    metadata: { academicYearId, studentCount: withBalance.length, sentCount },
  });

  return { success: true, sentCount };
}
