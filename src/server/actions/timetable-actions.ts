"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { requireSectionActionAccess } from "@/lib/rbac/scope";
import { setTimetableEntrySchema } from "@/lib/validation/timetable";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function setTimetableEntryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const parsed = setTimetableEntrySchema.safeParse({
    sectionId: formData.get("sectionId"),
    weekday: formData.get("weekday"),
    period: formData.get("period"),
    subjectId: formData.get("subjectId"),
    teacherId: formData.get("teacherId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await requireSectionActionAccess(session, parsed.data.sectionId, "academics.timetable");

  if (!parsed.data.subjectId) {
    await db.timetableEntry.deleteMany({
      where: { sectionId: parsed.data.sectionId, weekday: parsed.data.weekday, period: parsed.data.period },
    });
  } else {
    await db.timetableEntry.upsert({
      where: {
        sectionId_weekday_period: {
          sectionId: parsed.data.sectionId,
          weekday: parsed.data.weekday,
          period: parsed.data.period,
        },
      },
      create: {
        sectionId: parsed.data.sectionId,
        weekday: parsed.data.weekday,
        period: parsed.data.period,
        subjectId: parsed.data.subjectId,
        teacherId: parsed.data.teacherId || null,
      },
      update: { subjectId: parsed.data.subjectId, teacherId: parsed.data.teacherId || null },
    });
  }

  await recordAudit({
    actorId: session!.userId,
    action: "timetable.set_entry",
    entityType: "Section",
    entityId: parsed.data.sectionId,
    metadata: { weekday: parsed.data.weekday, period: parsed.data.period },
  });

  revalidatePath("/admin/timetable");
  revalidatePath("/teacher/timetable");
  return { success: true };
}
