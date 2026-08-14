import { z } from "zod";

export const attendanceStatusEnum = z.enum(["PRESENT", "ABSENT", "LATE", "HALF_DAY"]);

export const attendanceRecordSchema = z.object({
  studentId: z.string().min(1),
  status: attendanceStatusEnum,
});

export const markAttendanceSchema = z.object({
  sectionId: z.string().min(1, "Select a section"),
  date: z.string().min(1, "Select a date"),
  records: z.array(attendanceRecordSchema),
});
