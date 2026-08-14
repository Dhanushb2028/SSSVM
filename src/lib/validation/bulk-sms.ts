import { z } from "zod";

export const bulkSmsSchema = z.object({
  branchId: z.string().min(1),
  targetType: z.enum(["ALL", "COURSE"]),
  courseId: z.string().optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(480, "Keep it under 480 characters"),
});
