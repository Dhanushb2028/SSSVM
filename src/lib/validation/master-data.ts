import { z } from "zod";

export const courseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  orderIndex: z.coerce.number().int().default(0),
});

export const subjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().optional().or(z.literal("")),
});
