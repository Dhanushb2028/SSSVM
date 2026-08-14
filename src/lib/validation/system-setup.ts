import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

export const branchSchema = z.object({
  organizationId: z.string().min(1, "Select an organization"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  city: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  isHostel: z.coerce.boolean().optional(),
});

export const academicYearSchema = z
  .object({
    branchId: z.string().min(1, "Select a branch"),
    name: z.string().trim().min(4, "Name is required, e.g. 2025-2026"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isCurrent: z.coerce.boolean().optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after the start date",
    path: ["endDate"],
  });
