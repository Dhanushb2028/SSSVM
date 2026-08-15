"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { feeComponentSchema, saveFeeStructureSchema } from "@/lib/validation/fee-structure";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createFeeComponentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("finance.fee_structure", "CREATE");
  const parsed = feeComponentSchema.safeParse({ name: formData.get("name"), category: formData.get("category") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const org = await db.organization.findFirst({ where: { deletedAt: null } });
  if (!org) return { error: "No organization exists yet." };

  const existing = await db.feeComponent.findFirst({ where: { organizationId: org.id, name: parsed.data.name, deletedAt: null } });
  if (existing) return { error: "A fee component with this name already exists." };

  const component = await db.feeComponent.create({ data: { organizationId: org.id, ...parsed.data } });
  await recordAudit({ actorId: session.userId, action: "fee_component.create", entityType: "FeeComponent", entityId: component.id });
  revalidatePath("/admin/finance/fee-structure");
  return { success: true };
}

export async function deleteFeeComponentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("finance.fee_structure", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id" };

  const existing = await db.feeComponent.findUnique({ where: { id } });
  if (!existing) return { error: "Fee component not found." };

  await db.feeComponent.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAudit({ actorId: session.userId, action: "fee_component.delete", entityType: "FeeComponent", entityId: id });
  revalidatePath("/admin/finance/fee-structure");
  return { success: true };
}

export async function saveFeeStructureAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("finance.fee_structure", "EDIT");

  let rows: unknown = [];
  try {
    rows = JSON.parse(String(formData.get("rows") ?? "[]"));
  } catch {
    rows = [];
  }

  const parsed = saveFeeStructureSchema.safeParse({
    branchId: formData.get("branchId"),
    courseId: formData.get("courseId"),
    academicYearId: formData.get("academicYearId"),
    rows,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  await db.$transaction(
    parsed.data.rows.map((r) =>
      db.feeStructure.upsert({
        where: {
          branchId_courseId_academicYearId_feeComponentId: {
            branchId: parsed.data.branchId,
            courseId: parsed.data.courseId,
            academicYearId: parsed.data.academicYearId,
            feeComponentId: r.feeComponentId,
          },
        },
        create: {
          branchId: parsed.data.branchId,
          courseId: parsed.data.courseId,
          academicYearId: parsed.data.academicYearId,
          feeComponentId: r.feeComponentId,
          amount: r.amount,
        },
        update: { amount: r.amount },
      }),
    ),
  );

  await recordAudit({
    actorId: session.userId,
    action: "fee_structure.save",
    entityType: "FeeStructure",
    metadata: { branchId: parsed.data.branchId, courseId: parsed.data.courseId, academicYearId: parsed.data.academicYearId },
  });
  revalidatePath("/admin/finance/fee-structure");
  return { success: true };
}
