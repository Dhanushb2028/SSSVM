import { z } from "zod";

export const studentSchema = z.object({
  admissionNumber: z.string().trim().min(1, "Admission number is required"),
  branchId: z.string().min(1, "Select a branch"),
  sectionId: z.string().optional().or(z.literal("")),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  bloodGroup: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  contactPhone: z.string().trim().optional().or(z.literal("")),
  contactEmail: z.email("Enter a valid email").optional().or(z.literal("")),
  admissionDate: z.string().min(1, "Admission date is required"),
});

export const generateStudentLoginSchema = z.object({
  studentId: z.string().min(1),
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const generateGuardianLoginSchema = z.object({
  guardianId: z.string().min(1),
  studentId: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const guardianLinkSchema = z.object({
  studentId: z.string().min(1),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  relationship: z.enum(["FATHER", "MOTHER", "GUARDIAN", "OTHER"]),
  isPrimary: z.coerce.boolean().optional(),
});
