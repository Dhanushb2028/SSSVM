import { z } from "zod";

export const syllabusTopicSchema = z.object({
  sectionId: z.string().min(1),
  subjectId: z.string().min(1, "Select a subject"),
  topic: z.string().trim().min(1, "Topic is required"),
  description: z.string().trim().optional().or(z.literal("")),
  plannedDate: z.string().min(1, "Planned date is required"),
  completedDate: z.string().optional().or(z.literal("")),
});
