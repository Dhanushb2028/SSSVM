import { z } from "zod";
import { ALL_MODULE_KEYS, PERMISSION_ACTIONS } from "@/lib/rbac/modules";

export const grantSchema = z.object({
  module: z.enum(ALL_MODULE_KEYS as unknown as [string, ...string[]]),
  action: z.enum(PERMISSION_ACTIONS),
});

export const permissionProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  grants: z.array(grantSchema),
});
