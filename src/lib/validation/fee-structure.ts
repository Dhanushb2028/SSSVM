import { z } from "zod";

export const feeComponentSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.enum(["TUITION", "TRANSPORT", "HOSTEL", "BOOKS", "UNIFORM", "OTHER"]),
});

export const feeStructureRowSchema = z.object({
  feeComponentId: z.string().min(1),
  amount: z.coerce.number().min(0),
});

export const saveFeeStructureSchema = z.object({
  branchId: z.string().min(1),
  courseId: z.string().min(1, "Select a course"),
  academicYearId: z.string().min(1, "Select an academic year"),
  rows: z.array(feeStructureRowSchema),
});
