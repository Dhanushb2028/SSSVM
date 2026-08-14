import "server-only";
import { db } from "@/lib/db";
import { computeRanks } from "@/server/services/exam-rank";

export async function getExamResultsForSection(examId: string, sectionId: string) {
  const [examSubjects, students] = await Promise.all([
    db.examSubject.findMany({ where: { examId }, include: { subject: true } }),
    db.student.findMany({ where: { sectionId, status: "ACTIVE", deletedAt: null }, orderBy: { firstName: "asc" } }),
  ]);

  const marks = await db.examMark.findMany({
    where: { examSubjectId: { in: examSubjects.map((es) => es.id) }, studentId: { in: students.map((s) => s.id) } },
  });

  const marksByStudent = new Map<string, Map<string, number>>();
  for (const m of marks) {
    if (!marksByStudent.has(m.studentId)) marksByStudent.set(m.studentId, new Map());
    marksByStudent.get(m.studentId)!.set(m.examSubjectId, m.marksObtained);
  }

  const maxTotal = examSubjects.reduce((sum, es) => sum + es.maxMarks, 0);

  const results = students.map((student) => {
    const studentMarks = marksByStudent.get(student.id) ?? new Map();
    const subjectResults = examSubjects.map((es) => ({
      subjectId: es.id,
      subjectName: es.subject.name,
      maxMarks: es.maxMarks,
      passMarks: es.passMarks,
      marksObtained: studentMarks.get(es.id) ?? null,
    }));
    const totalMarks = subjectResults.reduce((sum, r) => sum + (r.marksObtained ?? 0), 0);
    const hasAllMarks = subjectResults.every((r) => r.marksObtained !== null);
    return { student, subjectResults, totalMarks, maxTotal, hasAllMarks };
  });

  const ranked = computeRanks(results.filter((r) => r.hasAllMarks).map((r) => ({ studentId: r.student.id, totalMarks: r.totalMarks })));
  const rankByStudent = new Map(ranked.map((r) => [r.studentId, r.rank]));

  return results.map((r) => ({ ...r, rank: rankByStudent.get(r.student.id) ?? null }));
}

export async function getExamResultForStudent(examId: string, studentId: string) {
  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student || !student.sectionId) return null;
  const results = await getExamResultsForSection(examId, student.sectionId);
  return results.find((r) => r.student.id === studentId) ?? null;
}
