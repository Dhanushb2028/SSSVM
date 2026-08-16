import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

const SORT_FIELDS = new Set(["name", "startDate"]);

export async function listExams(params: TableParams, scopeBranchId: string | null) {
  const where = {
    deletedAt: null,
    ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
    ...(params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : {}),
  };
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "startDate"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.exam.findMany({
      where,
      orderBy,
      ...toPrismaSkipTake(params),
      include: { branch: true, academicYear: true, examType: true, course: true, subjects: { include: { subject: true } } },
    }),
    db.exam.count({ where }),
  ]);
  return { rows, totalCount };
}

export async function getExamDetail(examId: string) {
  return db.exam.findUnique({
    where: { id: examId },
    include: { subjects: { include: { subject: true } }, branch: true, academicYear: true, examType: true, course: true },
  });
}

export async function listExamPickerData(scopeBranchId: string | null) {
  const [branches, academicYears, examTypes, subjects, courses] = await Promise.all([
    db.branch.findMany({ where: { deletedAt: null, ...(scopeBranchId ? { id: scopeBranchId } : {}) }, orderBy: { name: "asc" } }),
    db.academicYear.findMany({ where: { ...(scopeBranchId ? { branchId: scopeBranchId } : {}) }, orderBy: { startDate: "desc" } }),
    db.examType.findMany({ orderBy: { name: "asc" } }),
    db.subject.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    db.course.findMany({ where: { deletedAt: null }, orderBy: { orderIndex: "asc" } }),
  ]);
  return { branches, academicYears, examTypes, subjects, courses };
}
