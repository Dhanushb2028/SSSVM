import { z } from "zod";

export const competitiveExamSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  examDate: z.string().optional().or(z.literal("")),
});

export const competitiveExamMarkSchema = z.object({
  competitiveExamId: z.string().min(1),
  studentId: z.string().min(1, "Select a student"),
  marksObtained: z.coerce.number().min(0),
  maxMarks: z.coerce.number().positive(),
  remarks: z.string().trim().optional().or(z.literal("")),
});
