import { z } from "zod";

export const staffMemberSchema = z.object({
  branchId: z.string().min(1, "Select a branch"),
  employeeCode: z.string().trim().min(1, "Employee code is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  designation: z.string().trim().min(1, "Designation is required"),
  department: z.string().trim().optional(),
  employmentType: z.enum(["PERMANENT", "CONTRACT", "PART_TIME"]),
  qualification: z.string().trim().optional(),
  phone: z.string().trim().min(1, "Phone is required"),
  email: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().optional(),
  joinDate: z.string().min(1, "Join date is required"),
});

export const markStaffLeftSchema = z.object({
  id: z.string().min(1),
  leftDate: z.string().min(1, "Left date is required"),
  leftReason: z.string().trim().min(1, "Reason is required"),
});

export const staffAttendanceRecordSchema = z.object({
  staffMemberId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "ON_DUTY", "LEAVE"]),
  remarks: z.string().trim().optional(),
});

export const markStaffAttendanceSchema = z.object({
  branchId: z.string().min(1),
  date: z.string().min(1, "Select a date"),
  records: z.array(staffAttendanceRecordSchema),
});

export const salaryComponentSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(["EARNING", "DEDUCTION"]),
});

export const salaryStructureRowSchema = z.object({
  salaryComponentId: z.string().min(1),
  amount: z.coerce.number().min(0),
});

export const saveSalaryStructureSchema = z.object({
  staffMemberId: z.string().min(1),
  rows: z.array(salaryStructureRowSchema),
});

export const generateStaffLoginSchema = z.object({
  staffMemberId: z.string().min(1),
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const generatePayslipsSchema = z.object({
  branchId: z.string().min(1),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});
