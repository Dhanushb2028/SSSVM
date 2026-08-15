"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { createExpenseSchema, cancelExpenseSchema } from "@/lib/validation/expense";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createExpenseAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("finance.expenditure", "CREATE");
  const parsed = createExpenseSchema.safeParse({
    branchId: formData.get("branchId"),
    category: formData.get("category"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const expense = await db.expense.create({
    data: {
      branchId: parsed.data.branchId,
      category: parsed.data.category || null,
      description: parsed.data.description,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
      createdByUserId: session.userId,
    },
  });
  await recordAudit({ actorId: session.userId, action: "expense.create", entityType: "Expense", entityId: expense.id });
  revalidatePath("/admin/finance/expenditure");
  return { success: true };
}

export async function cancelExpenseAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("finance.expenditure", "DELETE");
  const parsed = cancelExpenseSchema.safeParse({ id: formData.get("id"), reason: formData.get("reason") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const existing = await db.expense.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return { error: "Expense not found." };
  if (existing.isCancelled) return { error: "This expense is already cancelled." };
  assertBranchAccess(session, existing.branchId);

  await db.expense.update({
    where: { id: parsed.data.id },
    data: { isCancelled: true, cancelledReason: parsed.data.reason, cancelledAt: new Date(), cancelledByUserId: session.userId },
  });
  await recordAudit({ actorId: session.userId, action: "expense.cancel", entityType: "Expense", entityId: parsed.data.id, metadata: { reason: parsed.data.reason } });
  revalidatePath("/admin/finance/expenditure");
  return { success: true };
}
