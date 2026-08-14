"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { requireSectionActionAccess } from "@/lib/rbac/scope";
import { markAttendanceSchema } from "@/lib/validation/attendance";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function markAttendanceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();

  let records: unknown;
  try {
    records = JSON.parse(String(formData.get("records") ?? "[]"));
  } catch {
    records = [];
  }

  const parsed = markAttendanceSchema.safeParse({
    sectionId: formData.get("sectionId"),
    date: formData.get("date"),
    records,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await requireSectionActionAccess(session, parsed.data.sectionId, "attendance.mark");

  const date = new Date(parsed.data.date);
  await db.$transaction(
    parsed.data.records.map((r) =>
      db.attendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date } },
        create: {
          studentId: r.studentId,
          sectionId: parsed.data.sectionId,
          date,
          status: r.status,
          markedByUserId: session!.userId,
        },
        update: { status: r.status, markedByUserId: session!.userId },
      }),
    ),
  );

  await recordAudit({
    actorId: session!.userId,
    action: "attendance.mark",
    entityType: "Section",
    entityId: parsed.data.sectionId,
    metadata: { date: parsed.data.date, studentCount: parsed.data.records.length },
  });

  revalidatePath("/admin/attendance/mark");
  revalidatePath("/teacher/attendance/mark");
  revalidatePath("/admin/attendance/reports");
  return { success: true };
}
