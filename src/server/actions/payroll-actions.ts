"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { salaryComponentSchema, saveSalaryStructureSchema, generatePayslipsSchema } from "@/lib/validation/hr";
import { generatePayslipsForBranch } from "@/server/services/payroll";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createSalaryComponentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hr.payroll", "CREATE");
  const parsed = salaryComponentSchema.safeParse({ name: formData.get("name"), type: formData.get("type") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const org = await db.organization.findFirst({ where: { deletedAt: null } });
  if (!org) return { error: "No organization exists yet." };

  const existing = await db.salaryComponent.findFirst({ where: { organizationId: org.id, name: parsed.data.name, deletedAt: null } });
  if (existing) return { error: "A salary component with this name already exists." };

  const component = await db.salaryComponent.create({ data: { organizationId: org.id, ...parsed.data } });
  await recordAudit({ actorId: session.userId, action: "salary_component.create", entityType: "SalaryComponent", entityId: component.id });
  revalidatePath("/admin/hr/payroll");
  return { success: true };
}

export async function deleteSalaryComponentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hr.payroll", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id" };

  await db.salaryComponent.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAudit({ actorId: session.userId, action: "salary_component.delete", entityType: "SalaryComponent", entityId: id });
  revalidatePath("/admin/hr/payroll");
  return { success: true };
}

export async function saveSalaryStructureAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hr.payroll", "EDIT");

  let rows: unknown = [];
  try {
    rows = JSON.parse(String(formData.get("rows") ?? "[]"));
  } catch {
    rows = [];
  }

  const parsed = saveSalaryStructureSchema.safeParse({ staffMemberId: formData.get("staffMemberId"), rows });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const staff = await db.staffMember.findUnique({ where: { id: parsed.data.staffMemberId } });
  if (!staff) return { error: "Staff member not found." };
  assertBranchAccess(session, staff.branchId);

  await db.$transaction(
    parsed.data.rows.map((r) =>
      db.staffSalaryComponent.upsert({
        where: { staffMemberId_salaryComponentId: { staffMemberId: parsed.data.staffMemberId, salaryComponentId: r.salaryComponentId } },
        create: { staffMemberId: parsed.data.staffMemberId, salaryComponentId: r.salaryComponentId, amount: r.amount },
        update: { amount: r.amount },
      }),
    ),
  );

  await recordAudit({
    actorId: session.userId,
    action: "salary_structure.save",
    entityType: "StaffMember",
    entityId: parsed.data.staffMemberId,
  });
  revalidatePath("/admin/hr/payroll");
  return { success: true };
}

export async function generatePayslipsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hr.payroll", "CREATE");
  const parsed = generatePayslipsSchema.safeParse({
    branchId: formData.get("branchId"),
    month: formData.get("month"),
    year: formData.get("year"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const result = await generatePayslipsForBranch(parsed.data.branchId, parsed.data.month, parsed.data.year, session.userId);

  await recordAudit({
    actorId: session.userId,
    action: "payslips.generate",
    entityType: "Branch",
    entityId: parsed.data.branchId,
    metadata: { month: parsed.data.month, year: parsed.data.year, ...result },
  });
  revalidatePath("/admin/hr/payroll");
  return { success: true };
}
