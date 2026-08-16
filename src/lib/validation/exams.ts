import { z } from "zod";

export const examTypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const examSubjectRowSchema = z.object({
  subjectId: z.string().min(1),
  maxMarks: z.coerce.number().int().positive(),
  passMarks: z.coerce.number().int().nonnegative().optional(),
  examDate: z.string().optional().or(z.literal("")),
});

export const examSchema = z.object({
  branchId: z.string().min(1, "Select a branch"),
  academicYearId: z.string().min(1, "Select an academic year"),
  examTypeId: z.string().min(1, "Select an exam type"),
  courseId: z.string().min(1, "Select a grade"),
  name: z.string().trim().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  includeInRank: z.coerce.boolean().optional(),
  subjects: z.array(examSubjectRowSchema).min(1, "Add at least one subject"),
});
