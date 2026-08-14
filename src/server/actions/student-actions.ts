"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { studentSchema, guardianLinkSchema } from "@/lib/validation/students";
import { recordAudit } from "@/server/services/audit";
import { getStorageProvider, StorageValidationError } from "@/lib/storage/provider";

type FormState = { error?: string; success?: boolean };

function toStudentData(formData: FormData) {
  return studentSchema.safeParse({
    admissionNumber: formData.get("admissionNumber"),
    branchId: formData.get("branchId"),
    sectionId: formData.get("sectionId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    dob: formData.get("dob"),
    gender: formData.get("gender"),
    bloodGroup: formData.get("bloodGroup"),
    address: formData.get("address"),
    contactPhone: formData.get("contactPhone"),
    contactEmail: formData.get("contactEmail"),
    admissionDate: formData.get("admissionDate"),
  });
}

async function uploadPhotoIfPresent(formData: FormData): Promise<string | undefined> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return undefined;
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await getStorageProvider().save({ name: file.name, mimeType: file.type, buffer }, "student-photos");
  return stored.url;
}

export async function createStudentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.students", "CREATE");
  const parsed = toStudentData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const existing = await db.student.findUnique({ where: { admissionNumber: parsed.data.admissionNumber } });
  if (existing) return { error: "A student with this admission number already exists." };

  let photoUrl: string | undefined;
  try {
    photoUrl = await uploadPhotoIfPresent(formData);
  } catch (e) {
    if (e instanceof StorageValidationError) return { error: e.message };
    throw e;
  }

  const student = await db.student.create({
    data: {
      admissionNumber: parsed.data.admissionNumber,
      branchId: parsed.data.branchId,
      sectionId: parsed.data.sectionId || null,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      dob: new Date(parsed.data.dob),
      gender: parsed.data.gender,
      bloodGroup: parsed.data.bloodGroup || null,
      address: parsed.data.address || null,
      contactPhone: parsed.data.contactPhone || null,
      contactEmail: parsed.data.contactEmail || null,
      admissionDate: new Date(parsed.data.admissionDate),
      photoUrl,
    },
  });
  await recordAudit({ actorId: session.userId, action: "student.create", entityType: "Student", entityId: student.id });
  revalidatePath("/admin/sis/students");
  redirect(`/admin/sis/students/${student.id}`);
}

export async function updateStudentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.students", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing student id" };

  const existing = await db.student.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Student not found." };
  assertBranchAccess(session, existing.branchId);

  const parsed = toStudentData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const dup = await db.student.findFirst({
    where: { admissionNumber: parsed.data.admissionNumber, NOT: { id } },
  });
  if (dup) return { error: "Another student already uses this admission number." };

  let photoUrl: string | undefined;
  try {
    photoUrl = await uploadPhotoIfPresent(formData);
  } catch (e) {
    if (e instanceof StorageValidationError) return { error: e.message };
    throw e;
  }

  await db.student.update({
    where: { id },
    data: {
      admissionNumber: parsed.data.admissionNumber,
      branchId: parsed.data.branchId,
      sectionId: parsed.data.sectionId || null,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      dob: new Date(parsed.data.dob),
      gender: parsed.data.gender,
      bloodGroup: parsed.data.bloodGroup || null,
      address: parsed.data.address || null,
      contactPhone: parsed.data.contactPhone || null,
      contactEmail: parsed.data.contactEmail || null,
      admissionDate: new Date(parsed.data.admissionDate),
      ...(photoUrl ? { photoUrl } : {}),
    },
  });
  await recordAudit({ actorId: session.userId, action: "student.update", entityType: "Student", entityId: id });
  revalidatePath("/admin/sis/students");
  revalidatePath(`/admin/sis/students/${id}`);
  return { success: true };
}

export async function trashStudentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.trash", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing student id" };

  const existing = await db.student.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Student not found." };
  assertBranchAccess(session, existing.branchId);

  await db.student.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAudit({ actorId: session.userId, action: "student.trash", entityType: "Student", entityId: id });
  revalidatePath("/admin/sis/students");
  revalidatePath("/admin/sis/trash");
  return { success: true };
}

export async function restoreStudentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.trash", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing student id" };

  const existing = await db.student.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Student not found." };
  assertBranchAccess(session, existing.branchId);

  await db.student.update({ where: { id }, data: { deletedAt: null } });
  await recordAudit({ actorId: session.userId, action: "student.restore", entityType: "Student", entityId: id });
  revalidatePath("/admin/sis/students");
  revalidatePath("/admin/sis/trash");
  return { success: true };
}

export async function markStudentLeftAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.outgoing", "EDIT");
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) return { error: "Missing student id" };

  const existing = await db.student.findUnique({ where: { id }, select: { branchId: true } });
  if (!existing) return { error: "Student not found." };
  assertBranchAccess(session, existing.branchId);

  await db.student.update({
    where: { id },
    data: { status: "LEFT", leftDate: new Date(), leftReason: reason || null },
  });
  await recordAudit({ actorId: session.userId, action: "student.mark_left", entityType: "Student", entityId: id });
  revalidatePath("/admin/sis/students");
  revalidatePath("/admin/sis/outgoing");
  revalidatePath(`/admin/sis/students/${id}`);
  return { success: true };
}

export async function linkGuardianAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.students", "EDIT");
  const parsed = guardianLinkSchema.safeParse({
    studentId: formData.get("studentId"),
    phone: formData.get("phone"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    relationship: formData.get("relationship"),
    isPrimary: formData.get("isPrimary") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const student = await db.student.findUnique({ where: { id: parsed.data.studentId }, select: { branchId: true } });
  if (!student) return { error: "Student not found." };
  assertBranchAccess(session, student.branchId);

  let guardian = await db.guardian.findUnique({ where: { phone: parsed.data.phone } });
  if (!guardian) {
    guardian = await db.guardian.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
      },
    });
  }

  const existingLink = await db.studentGuardian.findUnique({
    where: { studentId_guardianId: { studentId: parsed.data.studentId, guardianId: guardian.id } },
  });
  if (existingLink) return { error: "This guardian is already linked to this student." };

  if (parsed.data.isPrimary) {
    await db.studentGuardian.updateMany({ where: { studentId: parsed.data.studentId }, data: { isPrimary: false } });
  }
  await db.studentGuardian.create({
    data: {
      studentId: parsed.data.studentId,
      guardianId: guardian.id,
      relationship: parsed.data.relationship,
      isPrimary: Boolean(parsed.data.isPrimary),
    },
  });

  await recordAudit({
    actorId: session.userId,
    action: "student.link_guardian",
    entityType: "Student",
    entityId: parsed.data.studentId,
  });
  revalidatePath(`/admin/sis/students/${parsed.data.studentId}`);
  return { success: true };
}

export async function unlinkGuardianAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("sis.students", "EDIT");
  const studentId = String(formData.get("studentId") ?? "");
  const guardianId = String(formData.get("guardianId") ?? "");
  if (!studentId || !guardianId) return { error: "Missing ids" };

  const student = await db.student.findUnique({ where: { id: studentId }, select: { branchId: true } });
  if (!student) return { error: "Student not found." };
  assertBranchAccess(session, student.branchId);

  await db.studentGuardian.delete({ where: { studentId_guardianId: { studentId, guardianId } } });
  await recordAudit({ actorId: session.userId, action: "student.unlink_guardian", entityType: "Student", entityId: studentId });
  revalidatePath(`/admin/sis/students/${studentId}`);
  return { success: true };
}
