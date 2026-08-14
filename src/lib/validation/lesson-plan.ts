import { z } from "zod";

export const lessonPlanSchema = z.object({
  sectionId: z.string().min(1),
  subjectId: z.string().min(1, "Select a subject"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  planText: z.string().trim().min(1, "Plan content is required"),
});
