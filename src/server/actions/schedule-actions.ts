"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { requireBranchActionAccess } from "@/lib/rbac/scope";
import { scheduleEventSchema } from "@/lib/validation/schedule";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

function toData(formData: FormData) {
  return scheduleEventSchema.safeParse({
    branchId: formData.get("branchId"),
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
}

export async function createScheduleEventAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const parsed = toData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await requireBranchActionAccess(session, parsed.data.branchId, "academics.schedule");

  const event = await db.scheduleEvent.create({
    data: {
      branchId: parsed.data.branchId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });
  await recordAudit({ actorId: session!.userId, action: "schedule_event.create", entityType: "ScheduleEvent", entityId: event.id });
  revalidatePath("/admin/academics/schedule");
  revalidatePath("/teacher/schedule");
  return { success: true };
}

export async function deleteScheduleEventAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing event id" };

  const existing = await db.scheduleEvent.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Event not found." };
  await requireBranchActionAccess(session, existing.branchId, "academics.schedule");

  await db.scheduleEvent.delete({ where: { id } });
  await recordAudit({ actorId: session!.userId, action: "schedule_event.delete", entityType: "ScheduleEvent", entityId: id });
  revalidatePath("/admin/academics/schedule");
  revalidatePath("/teacher/schedule");
  return { success: true };
}
