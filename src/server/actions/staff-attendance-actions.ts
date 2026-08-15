"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { markStaffAttendanceSchema } from "@/lib/validation/hr";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function markStaffAttendanceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hr.attendance", "CREATE");

  let records: unknown;
  try {
    records = JSON.parse(String(formData.get("records") ?? "[]"));
  } catch {
    records = [];
  }

  const parsed = markStaffAttendanceSchema.safeParse({
    branchId: formData.get("branchId"),
    date: formData.get("date"),
    records,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const date = new Date(parsed.data.date);
  const actorId = (await getSession())!.userId;
  await db.$transaction(
    parsed.data.records.map((r) =>
      db.staffAttendance.upsert({
        where: { staffMemberId_date: { staffMemberId: r.staffMemberId, date } },
        create: {
          staffMemberId: r.staffMemberId,
          branchId: parsed.data.branchId,
          date,
          status: r.status,
          remarks: r.remarks || null,
          markedByUserId: actorId,
        },
        update: { status: r.status, remarks: r.remarks || null, markedByUserId: actorId },
      }),
    ),
  );

  await recordAudit({
    actorId,
    action: "staff_attendance.mark",
    entityType: "Branch",
    entityId: parsed.data.branchId,
    metadata: { date: parsed.data.date, staffCount: parsed.data.records.length },
  });

  revalidatePath("/admin/hr/attendance");
  revalidatePath("/admin/hr/attendance/reports");
  return { success: true };
}
