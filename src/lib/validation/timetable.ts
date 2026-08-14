import { z } from "zod";

export const weekdayEnum = z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]);

export const setTimetableEntrySchema = z.object({
  sectionId: z.string().min(1),
  weekday: weekdayEnum,
  period: z.coerce.number().int().min(1).max(8),
  subjectId: z.string().optional().or(z.literal("")),
  teacherId: z.string().optional().or(z.literal("")),
});
