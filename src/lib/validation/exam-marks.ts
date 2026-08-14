import { z } from "zod";

export const markRowSchema = z.object({
  studentId: z.string().min(1),
  marksObtained: z.coerce.number().min(0),
});

export const enterMarksSchema = z.object({
  examSubjectId: z.string().min(1),
  sectionId: z.string().min(1),
  notify: z.coerce.boolean().optional(),
  records: z.array(markRowSchema),
});
