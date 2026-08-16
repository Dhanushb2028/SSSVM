import "server-only";
import { db } from "@/lib/db";
import type { TableParams } from "@/lib/data-table/params";
import { toPrismaSkipTake } from "@/lib/data-table/params";

const SORT_FIELDS = new Set(["firstName", "admissionNumber", "createdAt", "dob"]);

export type StudentFilters = {
  branchId?: string;
  courseId?: string;
  sectionId?: string;
  status?: "ACTIVE" | "PROMOTED" | "LEFT";
};

function baseWhere(scopeBranchId: string | null, filters: StudentFilters, q: string, includeDeleted = false) {
  return {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...(scopeBranchId ? { branchId: scopeBranchId } : filters.branchId ? { branchId: filters.branchId } : {}),
    ...(filters.sectionId ? { sectionId: filters.sectionId } : filters.courseId ? { section: { courseId: filters.courseId } } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            { admissionNumber: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function listStudents(params: TableParams, scopeBranchId: string | null, filters: StudentFilters = {}) {
  const where = baseWhere(scopeBranchId, filters, params.q);
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "firstName"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.student.findMany({
      where,
      orderBy,
      ...toPrismaSkipTake(params),
      include: { branch: true, section: { include: { course: true } } },
    }),
    db.student.count({ where }),
  ]);

  return { rows, totalCount };
}

export async function listTrashedStudents(params: TableParams, scopeBranchId: string | null) {
  const where = {
    deletedAt: { not: null },
    ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
    ...(params.q
      ? {
          OR: [
            { firstName: { contains: params.q, mode: "insensitive" as const } },
            { lastName: { contains: params.q, mode: "insensitive" as const } },
            { admissionNumber: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const orderBy = { [SORT_FIELDS.has(params.sort ?? "") ? params.sort! : "firstName"]: params.dir };

  const [rows, totalCount] = await Promise.all([
    db.student.findMany({ where, orderBy, ...toPrismaSkipTake(params), include: { branch: true, section: { include: { course: true } } } }),
    db.student.count({ where }),
  ]);

  return { rows, totalCount };
}

export async function getStudentDetail(id: string) {
  return db.student.findUnique({
    where: { id },
    include: {
      branch: true,
      section: { include: { course: true, academicYear: true } },
      guardians: { include: { guardian: { include: { user: true } } } },
      routeStop: { include: { route: true } },
      user: true,
    },
  });
}

export async function listStudentFilterData(scopeBranchId: string | null) {
  const [branches, courses, sections] = await Promise.all([
    db.branch.findMany({ where: { deletedAt: null, ...(scopeBranchId ? { id: scopeBranchId } : {}) }, orderBy: { name: "asc" } }),
    db.course.findMany({ where: { deletedAt: null }, orderBy: { orderIndex: "asc" } }),
    db.section.findMany({
      where: { deletedAt: null, ...(scopeBranchId ? { branchId: scopeBranchId } : {}) },
      include: { course: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { branches, courses, sections };
}
