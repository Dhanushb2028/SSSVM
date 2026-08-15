"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { enquirySchema, convertEnquirySchema } from "@/lib/validation/admissions";
import { recordAudit } from "@/server/services/audit";
import type { EnquiryStatus } from "@prisma/client";

type FormState = { error?: string; success?: boolean };

export async function createEnquiryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("admissions.enquiries", "CREATE");
  const parsed = enquirySchema.safeParse({
    branchId: formData.get("branchId"),
    courseId: formData.get("courseId"),
    studentName: formData.get("studentName"),
    parentName: formData.get("parentName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    source: formData.get("source"),
    assignedMeoId: formData.get("assignedMeoId"),
    feeCommitment: formData.get("feeCommitment"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const enquiry = await db.admissionEnquiry.create({
    data: {
      branchId: parsed.data.branchId,
      courseId: parsed.data.courseId || null,
      studentName: parsed.data.studentName,
      parentName: parsed.data.parentName,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      source: parsed.data.source || null,
      assignedMeoId: parsed.data.assignedMeoId || null,
      feeCommitment: parsed.data.feeCommitment,
      notes: parsed.data.notes || null,
    },
  });
  await recordAudit({ actorId: session.userId, action: "enquiry.create", entityType: "AdmissionEnquiry", entityId: enquiry.id });
  revalidatePath("/admin/admissions/enquiries");
  return { success: true };
}

const STAGE_ORDER: EnquiryStatus[] = ["NEW", "CONTACTED", "VISITED", "APPLIED", "ADMITTED"];

export async function advanceEnquiryStageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("admissions.enquiries", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing enquiry id" };

  const existing = await db.admissionEnquiry.findUnique({ where: { id } });
  if (!existing) return { error: "Enquiry not found." };
  assertBranchAccess(session, existing.branchId);
  if (existing.status === "ADMITTED") return { error: "Already admitted." };

  const currentIndex = STAGE_ORDER.indexOf(existing.status);
  const nextStatus = STAGE_ORDER[Math.min(currentIndex + 1, STAGE_ORDER.length - 2)];

  await db.admissionEnquiry.update({
    where: { id },
    data: {
      status: nextStatus,
      visitCount: nextStatus === "VISITED" ? { increment: 1 } : undefined,
    },
  });
  await recordAudit({ actorId: session.userId, action: "enquiry.advance_stage", entityType: "AdmissionEnquiry", entityId: id, metadata: { nextStatus } });
  revalidatePath("/admin/admissions/enquiries");
  revalidatePath("/admin/admissions/applications");
  return { success: true };
}

export async function markEnquiryLostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("admissions.enquiries", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing enquiry id" };

  const existing = await db.admissionEnquiry.findUnique({ where: { id } });
  if (!existing) return { error: "Enquiry not found." };
  assertBranchAccess(session, existing.branchId);

  await db.admissionEnquiry.update({ where: { id }, data: { status: "LOST" } });
  await recordAudit({ actorId: session.userId, action: "enquiry.mark_lost", entityType: "AdmissionEnquiry", entityId: id });
  revalidatePath("/admin/admissions/enquiries");
  return { success: true };
}

export async function convertEnquiryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("admissions.applications", "CREATE");
  const parsed = convertEnquirySchema.safeParse({
    enquiryId: formData.get("enquiryId"),
    admissionNumber: formData.get("admissionNumber"),
    dob: formData.get("dob"),
    gender: formData.get("gender"),
    sectionId: formData.get("sectionId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const enquiry = await db.admissionEnquiry.findUnique({ where: { id: parsed.data.enquiryId } });
  if (!enquiry) return { error: "Enquiry not found." };
  if (enquiry.status === "ADMITTED") return { error: "Already converted." };
  assertBranchAccess(session, enquiry.branchId);

  const dupAdmission = await db.student.findUnique({ where: { admissionNumber: parsed.data.admissionNumber } });
  if (dupAdmission) return { error: "That admission number is already in use." };

  if (parsed.data.sectionId) {
    const section = await db.section.findUnique({ where: { id: parsed.data.sectionId } });
    if (!section || section.branchId !== enquiry.branchId) return { error: "That section does not belong to this enquiry's branch." };
  }

  const [firstName, ...rest] = enquiry.studentName.trim().split(" ");
  const lastName = rest.join(" ") || firstName;

  const result = await db.$transaction(async (tx) => {
    const student = await tx.student.create({
      data: {
        admissionNumber: parsed.data.admissionNumber,
        branchId: enquiry.branchId,
        sectionId: parsed.data.sectionId || null,
        firstName,
        lastName,
        dob: new Date(parsed.data.dob),
        gender: parsed.data.gender,
        contactPhone: enquiry.phone,
        contactEmail: enquiry.email,
      },
    });
    await tx.admissionEnquiry.update({
      where: { id: enquiry.id },
      data: { status: "ADMITTED", convertedStudentId: student.id },
    });
    return student;
  });

  await recordAudit({
    actorId: session.userId,
    action: "enquiry.convert_to_admission",
    entityType: "Student",
    entityId: result.id,
    metadata: { enquiryId: enquiry.id },
  });
  revalidatePath("/admin/admissions/enquiries");
  revalidatePath("/admin/admissions/applications");
  return { success: true };
}
