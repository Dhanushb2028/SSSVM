"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function issueTcAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("certificates.tc", "CREATE");
  const studentId = String(formData.get("studentId") ?? "");
  const tcNumber = String(formData.get("tcNumber") ?? "").trim();
  if (!studentId) return { error: "Missing student id" };
  if (!tcNumber) return { error: "TC number is required" };

  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student) return { error: "Student not found." };
  assertBranchAccess(session, student.branchId);
  if (!student.tcEligible) return { error: "This student is not marked eligible for TC issuance." };
  if (student.tcIssued) return { error: "TC has already been issued for this student." };

  await db.student.update({
    where: { id: studentId },
    data: { tcIssued: true, tcNumber, tcIssuedDate: new Date() },
  });
  await recordAudit({ actorId: session.userId, action: "tc.issue", entityType: "Student", entityId: studentId, metadata: { tcNumber } });
  revalidatePath("/admin/certificates");
  return { success: true };
}
