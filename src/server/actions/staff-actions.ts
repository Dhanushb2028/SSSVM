"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { hashPassword } from "@/lib/auth/password";
import { staffMemberSchema, markStaffLeftSchema, generateStaffLoginSchema } from "@/lib/validation/hr";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

function parseStaffForm(formData: FormData) {
  return staffMemberSchema.safeParse({
    branchId: formData.get("branchId"),
    employeeCode: formData.get("employeeCode"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    designation: formData.get("designation"),
    department: formData.get("department"),
    employmentType: formData.get("employmentType"),
    qualification: formData.get("qualification"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    joinDate: formData.get("joinDate"),
  });
}

export async function createStaffAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hr.staff", "CREATE");
  const parsed = parseStaffForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const existing = await db.staffMember.findUnique({ where: { employeeCode: parsed.data.employeeCode } });
  if (existing) return { error: "A staff member with this employee code already exists." };

  const staff = await db.staffMember.create({
    data: { ...parsed.data, email: parsed.data.email || null, joinDate: new Date(parsed.data.joinDate) },
  });
  await recordAudit({ actorId: session.userId, action: "staff.create", entityType: "StaffMember", entityId: staff.id });
  revalidatePath("/admin/hr/staff");
  return { success: true };
}

export async function updateStaffAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hr.staff", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing staff id" };
  const parsed = parseStaffForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const existing = await db.staffMember.findUnique({ where: { id } });
  if (!existing) return { error: "Staff member not found." };
  assertBranchAccess(session, existing.branchId);
  assertBranchAccess(session, parsed.data.branchId);

  if (parsed.data.employeeCode !== existing.employeeCode) {
    const codeClash = await db.staffMember.findUnique({ where: { employeeCode: parsed.data.employeeCode } });
    if (codeClash) return { error: "A staff member with this employee code already exists." };
  }

  await db.staffMember.update({
    where: { id },
    data: { ...parsed.data, email: parsed.data.email || null, joinDate: new Date(parsed.data.joinDate) },
  });
  await recordAudit({ actorId: session.userId, action: "staff.update", entityType: "StaffMember", entityId: id });
  revalidatePath("/admin/hr/staff");
  return { success: true };
}

export async function markStaffLeftAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hr.staff", "EDIT");
  const parsed = markStaffLeftSchema.safeParse({
    id: formData.get("id"),
    leftDate: formData.get("leftDate"),
    leftReason: formData.get("leftReason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const existing = await db.staffMember.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return { error: "Staff member not found." };
  assertBranchAccess(session, existing.branchId);

  await db.staffMember.update({
    where: { id: parsed.data.id },
    data: { status: "LEFT", leftDate: new Date(parsed.data.leftDate), leftReason: parsed.data.leftReason },
  });
  await recordAudit({ actorId: session.userId, action: "staff.mark_left", entityType: "StaffMember", entityId: parsed.data.id });
  revalidatePath("/admin/hr/staff");
  return { success: true };
}

export async function generateStaffLoginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hr.staff", "EDIT");
  const parsed = generateStaffLoginSchema.safeParse({
    staffMemberId: formData.get("staffMemberId"),
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const staff = await db.staffMember.findUnique({ where: { id: parsed.data.staffMemberId }, include: { user: true } });
  if (!staff) return { error: "Staff member not found." };
  assertBranchAccess(session, staff.branchId);
  if (staff.user) return { error: "This staff member already has a login." };

  const usernameClash = await db.user.findUnique({ where: { username: parsed.data.username } });
  if (usernameClash) return { error: "That username is already taken." };

  const passwordHash = await hashPassword(parsed.data.password);
  await db.user.create({
    data: { role: "TEACHER", username: parsed.data.username, passwordHash, branchId: staff.branchId, staffMemberId: staff.id },
  });
  await recordAudit({ actorId: session.userId, action: "staff.generate_login", entityType: "StaffMember", entityId: staff.id });
  revalidatePath("/admin/hr/staff");
  return { success: true };
}
