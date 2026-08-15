"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { createBankTransactionSchema, cancelBankTransactionSchema } from "@/lib/validation/banking";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createBankTransactionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("finance.banking", "CREATE");
  const parsed = createBankTransactionSchema.safeParse({
    branchId: formData.get("branchId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    date: formData.get("date"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const transaction = await db.bankTransaction.create({
    data: {
      branchId: parsed.data.branchId,
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description || null,
      date: new Date(parsed.data.date),
      createdByUserId: session.userId,
    },
  });
  await recordAudit({ actorId: session.userId, action: "bank_transaction.create", entityType: "BankTransaction", entityId: transaction.id });
  revalidatePath("/admin/finance/banking");
  return { success: true };
}

export async function cancelBankTransactionAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("finance.banking", "DELETE");
  const parsed = cancelBankTransactionSchema.safeParse({ id: formData.get("id"), reason: formData.get("reason") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const existing = await db.bankTransaction.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return { error: "Transaction not found." };
  if (existing.isCancelled) return { error: "This transaction is already cancelled." };
  assertBranchAccess(session, existing.branchId);

  await db.bankTransaction.update({
    where: { id: parsed.data.id },
    data: { isCancelled: true, cancelledReason: parsed.data.reason, cancelledAt: new Date(), cancelledByUserId: session.userId },
  });
  await recordAudit({ actorId: session.userId, action: "bank_transaction.cancel", entityType: "BankTransaction", entityId: parsed.data.id, metadata: { reason: parsed.data.reason } });
  revalidatePath("/admin/finance/banking");
  return { success: true };
}
