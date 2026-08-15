import "server-only";
import { db } from "@/lib/db";
import { computeFeeDue, type FeeDueSummary } from "@/server/services/fee-calculations";

export async function getStudentFeeDue(studentId: string, academicYearId: string): Promise<FeeDueSummary | null> {
  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student || !student.sectionId) return null;

  const section = await db.section.findUnique({ where: { id: student.sectionId } });
  if (!section) return null;

  const [structure, transactions] = await Promise.all([
    db.feeStructure.findMany({ where: { branchId: student.branchId, courseId: section.courseId, academicYearId } }),
    db.feeTransaction.findMany({ where: { studentId, academicYearId }, select: { amount: true, isCancelled: true } }),
  ]);

  const totalDue = structure.reduce((sum, s) => sum + s.amount, 0);
  return computeFeeDue(totalDue, transactions);
}

export async function getFeeDueReport(branchId: string, academicYearId: string) {
  const students = await db.student.findMany({
    where: { branchId, status: "ACTIVE", deletedAt: null },
    include: { section: { include: { course: true } } },
  });

  const structuresByCourseId = new Map<string, number>();
  const structures = await db.feeStructure.findMany({ where: { branchId, academicYearId } });
  for (const s of structures) {
    structuresByCourseId.set(s.courseId, (structuresByCourseId.get(s.courseId) ?? 0) + s.amount);
  }

  const transactions = await db.feeTransaction.findMany({
    where: { branchId, academicYearId, studentId: { in: students.map((s) => s.id) } },
    select: { studentId: true, amount: true, isCancelled: true },
  });
  const transactionsByStudent = new Map<string, { amount: number; isCancelled: boolean }[]>();
  for (const t of transactions) {
    if (!transactionsByStudent.has(t.studentId)) transactionsByStudent.set(t.studentId, []);
    transactionsByStudent.get(t.studentId)!.push(t);
  }

  return students
    .filter((s) => s.section)
    .map((s) => {
      const totalDue = structuresByCourseId.get(s.section!.courseId) ?? 0;
      const summary = computeFeeDue(totalDue, transactionsByStudent.get(s.id) ?? []);
      return { student: s, ...summary };
    })
    .filter((r) => r.totalDue > 0);
}
