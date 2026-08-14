"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { requireSectionActionAccess } from "@/lib/rbac/scope";
import { enterMarksSchema } from "@/lib/validation/exam-marks";
import { recordAudit } from "@/server/services/audit";
import { getNotificationProvider } from "@/lib/notifications/provider";

type FormState = { error?: string; success?: boolean };

export async function saveExamMarksAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();

  let records: unknown = [];
  try {
    records = JSON.parse(String(formData.get("records") ?? "[]"));
  } catch {
    records = [];
  }

  const parsed = enterMarksSchema.safeParse({
    examSubjectId: formData.get("examSubjectId"),
    sectionId: formData.get("sectionId"),
    notify: formData.get("notify") === "on",
    records,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await requireSectionActionAccess(session, parsed.data.sectionId, "exams.marks");

  const examSubject = await db.examSubject.findUnique({ where: { id: parsed.data.examSubjectId } });
  if (!examSubject) return { error: "Exam subject not found." };

  const overMax = parsed.data.records.filter((r) => r.marksObtained > examSubject.maxMarks);
  if (overMax.length > 0) {
    return { error: `${overMax.length} mark(s) exceed the maximum of ${examSubject.maxMarks}.` };
  }

  await db.$transaction(
    parsed.data.records.map((r) =>
      db.examMark.upsert({
        where: { examSubjectId_studentId: { examSubjectId: parsed.data.examSubjectId, studentId: r.studentId } },
        create: {
          examSubjectId: parsed.data.examSubjectId,
          studentId: r.studentId,
          marksObtained: r.marksObtained,
          enteredByUserId: session!.userId,
        },
        update: { marksObtained: r.marksObtained, enteredByUserId: session!.userId },
      }),
    ),
  );

  if (parsed.data.notify) {
    const provider = getNotificationProvider();
    const students = await db.student.findMany({
      where: { id: { in: parsed.data.records.map((r) => r.studentId) } },
      include: { guardians: { include: { guardian: true } } },
    });
    for (const student of students) {
      const mark = parsed.data.records.find((r) => r.studentId === student.id);
      for (const link of student.guardians) {
        await provider.sendSms({
          to: link.guardian.phone,
          body: `${student.firstName} scored ${mark?.marksObtained}/${examSubject.maxMarks} — SSSVM`,
        });
      }
    }
  }

  await recordAudit({
    actorId: session!.userId,
    action: "exam_marks.save",
    entityType: "ExamSubject",
    entityId: parsed.data.examSubjectId,
    metadata: { sectionId: parsed.data.sectionId, studentCount: parsed.data.records.length, notified: Boolean(parsed.data.notify) },
  });

  revalidatePath("/admin/exams/marks-entry");
  revalidatePath("/teacher/exams/marks-entry");
  return { success: true };
}
