import { z } from "zod";

export const sectionSchema = z.object({
  academicYearId: z.string().min(1, "Select an academic year"),
  branchId: z.string().min(1, "Select a branch"),
  courseId: z.string().min(1, "Select a course"),
  name: z.string().trim().min(1, "Section name is required, e.g. A"),
  capacity: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  classTeacherId: z.string().optional().or(z.literal("")),
});
