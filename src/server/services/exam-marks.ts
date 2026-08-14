import "server-only";
import { db } from "@/lib/db";

export async function getMarksRoster(examSubjectId: string, sectionId: string) {
  const [examSubject, students, marks] = await Promise.all([
    db.examSubject.findUnique({ where: { id: examSubjectId }, include: { subject: true, exam: true } }),
    db.student.findMany({ where: { sectionId, status: "ACTIVE", deletedAt: null }, orderBy: { firstName: "asc" } }),
    db.examMark.findMany({ where: { examSubjectId } }),
  ]);

  const byStudent = new Map(marks.map((m) => [m.studentId, m.marksObtained]));
  return {
    examSubject,
    roster: students.map((s) => ({ ...s, marksObtained: byStudent.get(s.id) ?? null })),
  };
}
