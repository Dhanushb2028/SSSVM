import { z } from "zod";

export const homeworkSchema = z.object({
  sectionId: z.string().min(1),
  subjectId: z.string().min(1, "Select a subject"),
  description: z.string().trim().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
});
