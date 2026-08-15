import { z } from "zod";

export const createBankTransactionSchema = z.object({
  branchId: z.string().min(1),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "RECEIVE", "PAY", "LOAN"]),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  description: z.string().trim().optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
});

export const cancelBankTransactionSchema = z.object({
  id: z.string().min(1),
  reason: z.string().trim().min(1, "A cancellation reason is required"),
});
