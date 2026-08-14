import { z } from "zod";

export const createAdminUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Only letters, numbers, dots, dashes and underscores allowed"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  branchId: z.string().optional().or(z.literal("")),
  permissionProfileId: z.string().optional().or(z.literal("")),
});

export const updateAdminUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  branchId: z.string().optional().or(z.literal("")),
  permissionProfileId: z.string().optional().or(z.literal("")),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
