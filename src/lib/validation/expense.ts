import { z } from "zod";

export const createExpenseSchema = z.object({
  branchId: z.string().min(1),
  category: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  date: z.string().min(1, "Date is required"),
});

export const cancelExpenseSchema = z.object({
  id: z.string().min(1),
  reason: z.string().trim().min(1, "A cancellation reason is required"),
});
