import { z } from "zod";

export const createFeeTransactionSchema = z.object({
  studentId: z.string().min(1, "Select a student"),
  academicYearId: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  mode: z.enum(["CASH", "CHEQUE", "ONLINE", "CARD"]),
  paidDate: z.string().min(1, "Date is required"),
  remarks: z.string().trim().optional().or(z.literal("")),
});

export const cancelFeeTransactionSchema = z.object({
  id: z.string().min(1),
  reason: z.string().trim().min(1, "A cancellation reason is required"),
});
