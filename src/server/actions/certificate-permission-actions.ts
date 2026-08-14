"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function setCertificatePermissionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.certificate_permission", "EDIT");
  const eligible = String(formData.get("eligible")) === "true";
  let studentIds: string[] = [];
  try {
    studentIds = JSON.parse(String(formData.get("studentIds") ?? "[]"));
  } catch {
    studentIds = [];
  }
  if (studentIds.length === 0) return { error: "Select at least one student." };

  const students = await db.student.findMany({ where: { id: { in: studentIds } }, select: { id: true, branchId: true } });
  for (const s of students) assertBranchAccess(session, s.branchId);

  await db.student.updateMany({ where: { id: { in: studentIds } }, data: { tcEligible: eligible } });

  await recordAudit({
    actorId: session.userId,
    action: eligible ? "student.tc_eligible_enable" : "student.tc_eligible_disable",
    entityType: "Student",
    metadata: { studentCount: studentIds.length, studentIds },
  });

  revalidatePath("/admin/sis/certificate-permission");
  return { success: true };
}
