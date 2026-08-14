import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your username or mobile number"),
  password: z.string().min(1, "Enter your password"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateOwnProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").optional(),
  lastName: z.string().trim().min(1, "Last name is required").optional(),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().min(6, "Enter a valid phone number").optional(),
});
