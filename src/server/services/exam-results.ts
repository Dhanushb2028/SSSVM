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

/**
 * Average % scored per exam, broken out by course (i.e. "Grade 5", "Grade 6" — the
 * class/category grouping above individual sections) — the data for the grade-trend
 * line chart on the Result Reports page. One row per exam, one numeric field per
 * course, pre-pivoted into the shape recharts' <Line> needs (dataKey = course name).
 */
export async function getGradeTrends(branchId: string | null) {
  const exams = await db.exam.findMany({
    where: { deletedAt: null, ...(branchId ? { branchId } : {}) },
    orderBy: { startDate: "asc" },
  });
  if (exams.length === 0) return { rows: [], courseNames: [] };

  const [examSubjects, sections, marks] = await Promise.all([
    db.examSubject.findMany({ where: { examId: { in: exams.map((e) => e.id) } } }),
    db.section.findMany({ where: { deletedAt: null, ...(branchId ? { branchId } : {}) }, include: { course: true } }),
    db.examMark.findMany({
      where: { examSubject: { examId: { in: exams.map((e) => e.id) } } },
      include: { student: { select: { sectionId: true } } },
    }),
  ]);

  const maxMarksByExamSubject = new Map(examSubjects.map((es) => [es.id, es.maxMarks]));
  const examIdByExamSubject = new Map(examSubjects.map((es) => [es.id, es.examId]));
  const courseBySection = new Map(sections.map((s) => [s.id, s.course]));

  // examId -> courseName -> running totals
  const totals = new Map<string, Map<string, { obtained: number; max: number }>>();
  for (const mark of marks) {
    const examId = examIdByExamSubject.get(mark.examSubjectId);
    const maxMarks = maxMarksByExamSubject.get(mark.examSubjectId);
    const course = mark.student.sectionId ? courseBySection.get(mark.student.sectionId) : undefined;
    if (!examId || maxMarks === undefined || !course) continue;

    if (!totals.has(examId)) totals.set(examId, new Map());
    const byCourse = totals.get(examId)!;
    const entry = byCourse.get(course.name) ?? { obtained: 0, max: 0 };
    entry.obtained += mark.marksObtained;
    entry.max += maxMarks;
    byCourse.set(course.name, entry);
  }

  const courseNames = Array.from(new Set(sections.map((s) => s.course.name))).sort();

  const rows = exams.map((exam) => {
    const row: { examId: string; examName: string; startDate: Date } & Record<string, number | string | Date> = {
      examId: exam.id,
      examName: exam.name,
      startDate: exam.startDate,
    };
    const byCourse = totals.get(exam.id);
    for (const courseName of courseNames) {
      const entry = byCourse?.get(courseName);
      if (entry && entry.max > 0) row[courseName] = Math.round((entry.obtained / entry.max) * 1000) / 10;
    }
    return row;
  });

  return { rows, courseNames };
}

/** Every exam a student's section has been part of, with that student's own result if marks exist yet — for the Student/Parent results view. */
export async function listExamResultsForStudent(studentId: string) {
  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student || !student.sectionId) return [];

  const exams = await db.exam.findMany({
    where: { branchId: student.branchId, deletedAt: null, subjects: { some: { marks: { some: { studentId } } } } },
    include: { examType: true },
    orderBy: { startDate: "desc" },
  });

  const results = await Promise.all(
    exams.map(async (exam) => ({
      exam,
      result: await getExamResultForStudent(exam.id, studentId),
    })),
  );
  return results.filter((r) => r.result);
}
