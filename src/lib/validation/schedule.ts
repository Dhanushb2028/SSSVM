import { z } from "zod";

export const scheduleEventSchema = z.object({
  branchId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
});
