import { z } from "zod";

export const meoSchema = z.object({
  branchId: z.string().min(1),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
});

export const enquirySchema = z.object({
  branchId: z.string().min(1),
  courseId: z.string().optional().or(z.literal("")),
  studentName: z.string().trim().min(1, "Student name is required"),
  parentName: z.string().trim().min(1, "Parent name is required"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
  source: z.string().trim().optional().or(z.literal("")),
  assignedMeoId: z.string().optional().or(z.literal("")),
  feeCommitment: z.coerce.number().optional(),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const convertEnquirySchema = z.object({
  enquiryId: z.string().min(1),
  admissionNumber: z.string().trim().min(1, "Admission number is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  sectionId: z.string().optional().or(z.literal("")),
});
