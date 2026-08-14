import { z } from "zod";

export const bannerSchema = z.object({
  branchId: z.string().min(1, "Select a branch"),
  title: z.string().trim().optional().or(z.literal("")),
  linkUrl: z.url("Enter a valid URL").optional().or(z.literal("")),
  orderIndex: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().optional(),
});
