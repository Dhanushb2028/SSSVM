import "server-only";
import { db } from "@/lib/db";

export const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export async function getTimetableForSection(sectionId: string) {
  return db.timetableEntry.findMany({
    where: { sectionId },
    include: { subject: true, teacher: true },
  });
}

export async function listTimetablePickerData(branchId: string | null) {
  const [subjects, teachers] = await Promise.all([
    db.subject.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    db.staffMember.findMany({
      where: { deletedAt: null, ...(branchId ? { branchId } : {}) },
      orderBy: { firstName: "asc" },
    }),
  ]);
  return { subjects, teachers };
}
