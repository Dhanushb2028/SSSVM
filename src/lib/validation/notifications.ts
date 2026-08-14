import { z } from "zod";

export const sendNotificationSchema = z.object({
  branchId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Message is required"),
  targetType: z.enum(["ALL", "SECTION", "STUDENT"]),
  sectionId: z.string().optional().or(z.literal("")),
  studentId: z.string().optional().or(z.literal("")),
});
