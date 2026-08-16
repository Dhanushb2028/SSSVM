"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { createFeeTransactionSchema, cancelFeeTransactionSchema } from "@/lib/validation/fee-transaction";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

async function nextReceiptNumber(branchId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.feeTransaction.count({ where: { branchId } });
  return `RCPT-${year}-${String(count + 1).padStart(5, "0")}`;
}

/** Two concurrent payments can read the same count() and collide on receiptNumber —
 * retry with a freshly recomputed number rather than losing the payment to an
 * uncaught unique-constraint error. */
async function createFeeTransactionWithRetry(
  data: Omit<Prisma.FeeTransactionUncheckedCreateInput, "receiptNumber">,
  branchId: string,
  attempts = 3,
) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const receiptNumber = await nextReceiptNumber(branchId);
      return await db.feeTransaction.create({ data: { ...data, receiptNumber } });
    } catch (e) {
      const isReceiptClash = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (!isReceiptClash || attempt === attempts) throw e;
    }
  }
  throw new Error("Unreachable");
}

export async function createFeeTransactionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("finance.transactions", "CREATE");
  const parsed = createFeeTransactionSchema.safeParse({
    studentId: formData.get("studentId"),
    academicYearId: formData.get("academicYearId"),
    amount: formData.get("amount"),
    mode: formData.get("mode"),
    paidDate: formData.get("paidDate"),
    remarks: formData.get("remarks"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const student = await db.student.findUnique({ where: { id: parsed.data.studentId } });
  if (!student) return { error: "Student not found." };
  assertBranchAccess(session, student.branchId);

  const transaction = await createFeeTransactionWithRetry(
    {
      studentId: parsed.data.studentId,
      branchId: student.branchId,
      academicYearId: parsed.data.academicYearId,
      amount: parsed.data.amount,
      mode: parsed.data.mode,
      paidDate: new Date(parsed.data.paidDate),
      remarks: parsed.data.remarks || null,
      collectedByUserId: session.userId,
    },
    student.branchId,
  );

  await recordAudit({ actorId: session.userId, action: "fee_transaction.create", entityType: "FeeTransaction", entityId: transaction.id });
  revalidatePath("/admin/finance/ledger");
  redirect(`/admin/finance/receipts/${transaction.id}`);
}

export async function cancelFeeTransactionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("finance.transactions", "DELETE");
  const parsed = cancelFeeTransactionSchema.safeParse({ id: formData.get("id"), reason: formData.get("reason") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const existing = await db.feeTransaction.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return { error: "Receipt not found." };
  if (existing.isCancelled) return { error: "This receipt is already cancelled." };
  assertBranchAccess(session, existing.branchId);

  await db.feeTransaction.update({
    where: { id: parsed.data.id },
    data: { isCancelled: true, cancelledReason: parsed.data.reason, cancelledAt: new Date(), cancelledByUserId: session.userId },
  });

  await recordAudit({
    actorId: session.userId,
    action: "fee_transaction.cancel",
    entityType: "FeeTransaction",
    entityId: parsed.data.id,
    metadata: { reason: parsed.data.reason, receiptNumber: existing.receiptNumber, amount: existing.amount },
  });
  revalidatePath("/admin/finance/ledger");
  revalidatePath(`/admin/finance/receipts/${parsed.data.id}`);
  return { success: true };
}
