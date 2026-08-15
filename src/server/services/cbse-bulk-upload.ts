import "server-only";
import Papa from "papaparse";
import { db } from "@/lib/db";

export type CbseUploadRowError = { row: number; message: string };
export type CbseUploadResult = { updatedCount: number; errors: CbseUploadRowError[] };

const REQUIRED_COLUMNS = ["admissionNumber", "fatherName", "motherName", "nationality", "category"];

/** Backfills CBSE-format fields (father/mother name, nationality, category) onto existing students ahead of TC issuance. */
export async function bulkUploadCbseData(csvText: string, scopeBranchId: string | null): Promise<CbseUploadResult> {
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
  const errors: CbseUploadRowError[] = [];

  const missingColumns = REQUIRED_COLUMNS.filter((c) => !parsed.meta.fields?.includes(c));
  if (missingColumns.length > 0) {
    return { updatedCount: 0, errors: [{ row: 0, message: `Missing required column(s): ${missingColumns.join(", ")}` }] };
  }

  let updatedCount = 0;

  for (let index = 0; index < parsed.data.length; index++) {
    const row = parsed.data[index];
    const rowNum = index + 2;
    const admissionNumber = row.admissionNumber?.trim();
    if (!admissionNumber) {
      errors.push({ row: rowNum, message: "Missing admission number." });
      continue;
    }

    const student = await db.student.findUnique({ where: { admissionNumber } });
    if (!student) {
      errors.push({ row: rowNum, message: `No student found with admission number "${admissionNumber}".` });
      continue;
    }
    if (scopeBranchId && student.branchId !== scopeBranchId) {
      errors.push({ row: rowNum, message: `Admission number "${admissionNumber}" is outside your branch scope.` });
      continue;
    }

    await db.student.update({
      where: { id: student.id },
      data: {
        fatherName: row.fatherName?.trim() || null,
        motherName: row.motherName?.trim() || null,
        nationality: row.nationality?.trim() || null,
        category: row.category?.trim() || null,
      },
    });
    updatedCount += 1;
  }

  return { updatedCount, errors };
}
