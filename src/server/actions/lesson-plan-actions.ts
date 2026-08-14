"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { requireSectionActionAccess } from "@/lib/rbac/scope";
import { lessonPlanSchema } from "@/lib/validation/lesson-plan";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function saveLessonPlanAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  const parsed = lessonPlanSchema.safeParse({
    sectionId: formData.get("sectionId"),
    subjectId: formData.get("subjectId"),
    month: formData.get("month"),
    year: formData.get("year"),
    planText: formData.get("planText"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await requireSectionActionAccess(session, parsed.data.sectionId, "academics.lesson_plans");

  const plan = await db.monthlyLessonPlan.upsert({
    where: {
      sectionId_subjectId_month_year: {
        sectionId: parsed.data.sectionId,
        subjectId: parsed.data.subjectId,
        month: parsed.data.month,
        year: parsed.data.year,
      },
    },
    create: parsed.data,
    update: { planText: parsed.data.planText },
  });

  await recordAudit({ actorId: session!.userId, action: "lesson_plan.save", entityType: "MonthlyLessonPlan", entityId: plan.id });
  revalidatePath("/admin/academics/lesson-plans");
  revalidatePath("/teacher/lesson-plans");
  return { success: true };
}
