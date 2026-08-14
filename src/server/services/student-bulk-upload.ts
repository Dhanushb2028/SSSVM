import "server-only";
import Papa from "papaparse";
import { db } from "@/lib/db";
import type { Gender, Prisma } from "@prisma/client";

export type BulkUploadRowError = { row: number; message: string };
export type BulkUploadResult = { createdCount: number; errors: BulkUploadRowError[] };

const REQUIRED_COLUMNS = ["admissionNumber", "firstName", "lastName", "dob", "gender", "branchName", "courseName", "sectionName"];

function parseGender(value: string): Gender | null {
  const upper = value.trim().toUpperCase();
  if (upper === "MALE" || upper === "FEMALE" || upper === "OTHER") return upper;
  return null;
}

/** Parses + validates each row before writing anything — bad rows are reported, never silently dropped (Section 10). */
export async function bulkUploadStudents(csvText: string, scopeBranchId: string | null): Promise<BulkUploadResult> {
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
  const errors: BulkUploadRowError[] = [];

  const missingColumns = REQUIRED_COLUMNS.filter((c) => !parsed.meta.fields?.includes(c));
  if (missingColumns.length > 0) {
    return { createdCount: 0, errors: [{ row: 0, message: `Missing required column(s): ${missingColumns.join(", ")}` }] };
  }

  const branches = await db.branch.findMany({ where: { deletedAt: null } });
  const sections = await db.section.findMany({ where: { deletedAt: null }, include: { course: true } });
  const existingAdmissionNumbers = new Set((await db.student.findMany({ select: { admissionNumber: true } })).map((s) => s.admissionNumber));
  const seenInBatch = new Set<string>();

  const toCreate: Prisma.StudentCreateManyInput[] = [];

  parsed.data.forEach((row, index) => {
    const rowNum = index + 2; // +1 for header row, +1 for 1-indexing
    const admissionNumber = row.admissionNumber?.trim();
    const firstName = row.firstName?.trim();
    const lastName = row.lastName?.trim();
    const dob = row.dob?.trim();
    const gender = parseGender(row.gender ?? "");
    const branchName = row.branchName?.trim();
    const courseName = row.courseName?.trim();
    const sectionName = row.sectionName?.trim();

    if (!admissionNumber || !firstName || !lastName || !dob || !branchName || !courseName || !sectionName) {
      errors.push({ row: rowNum, message: "Missing one or more required fields." });
      return;
    }
    if (!gender) {
      errors.push({ row: rowNum, message: `Invalid gender "${row.gender}" (expected MALE, FEMALE, or OTHER).` });
      return;
    }
    if (Number.isNaN(new Date(dob).getTime())) {
      errors.push({ row: rowNum, message: `Invalid date of birth "${dob}".` });
      return;
    }
    if (existingAdmissionNumbers.has(admissionNumber) || seenInBatch.has(admissionNumber)) {
      errors.push({ row: rowNum, message: `Admission number "${admissionNumber}" already exists.` });
      return;
    }

    const branch = branches.find((b) => b.name.toLowerCase() === branchName.toLowerCase() && (!scopeBranchId || b.id === scopeBranchId));
    if (!branch) {
      errors.push({ row: rowNum, message: `Branch "${branchName}" not found.` });
      return;
    }
    const section = sections.find(
      (s) =>
        s.branchId === branch.id &&
        s.course.name.toLowerCase() === courseName.toLowerCase() &&
        s.name.toLowerCase() === sectionName.toLowerCase(),
    );
    if (!section) {
      errors.push({ row: rowNum, message: `Section "${courseName} - ${sectionName}" not found in branch "${branchName}".` });
      return;
    }

    seenInBatch.add(admissionNumber);
    toCreate.push({
      admissionNumber,
      firstName,
      lastName,
      dob: new Date(dob),
      gender,
      branchId: branch.id,
      sectionId: section.id,
      admissionDate: row.admissionDate?.trim() ? new Date(row.admissionDate.trim()) : new Date(),
      contactPhone: row.contactPhone?.trim() || null,
      contactEmail: row.contactEmail?.trim() || null,
      bloodGroup: row.bloodGroup?.trim() || null,
      address: row.address?.trim() || null,
    });
  });

  if (toCreate.length > 0) {
    await db.student.createMany({ data: toCreate });
  }

  return { createdCount: toCreate.length, errors };
}
