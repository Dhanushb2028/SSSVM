"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { hostelSchema, hostelRoomSchema, assignHostelRoomSchema } from "@/lib/validation/hostel";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createHostelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hostel.manage", "CREATE");
  const parsed = hostelSchema.safeParse({
    branchId: formData.get("branchId"),
    name: formData.get("name"),
    wardenId: formData.get("wardenId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const existing = await db.hostel.findFirst({ where: { branchId: parsed.data.branchId, name: parsed.data.name, deletedAt: null } });
  if (existing) return { error: "A hostel with this name already exists." };

  const hostel = await db.hostel.create({
    data: { branchId: parsed.data.branchId, name: parsed.data.name, wardenId: parsed.data.wardenId || null },
  });
  await recordAudit({ actorId: session.userId, action: "hostel.create", entityType: "Hostel", entityId: hostel.id });
  revalidatePath("/admin/hostel");
  return { success: true };
}

export async function deleteHostelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hostel.manage", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id" };

  const existing = await db.hostel.findUnique({ where: { id } });
  if (!existing) return { error: "Hostel not found." };
  assertBranchAccess(session, existing.branchId);

  const occupied = await db.student.count({ where: { hostelRoom: { hostelId: id } } });
  if (occupied > 0) return { error: `Cannot delete: ${occupied} student(s) are allotted rooms in this hostel.` };

  await db.$transaction([
    db.hostelRoom.deleteMany({ where: { hostelId: id } }),
    db.hostel.update({ where: { id }, data: { deletedAt: new Date() } }),
  ]);
  await recordAudit({ actorId: session.userId, action: "hostel.delete", entityType: "Hostel", entityId: id });
  revalidatePath("/admin/hostel");
  return { success: true };
}

export async function createHostelRoomAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hostel.manage", "CREATE");
  const parsed = hostelRoomSchema.safeParse({
    hostelId: formData.get("hostelId"),
    roomNumber: formData.get("roomNumber"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const hostel = await db.hostel.findUnique({ where: { id: parsed.data.hostelId } });
  if (!hostel) return { error: "Hostel not found." };
  assertBranchAccess(session, hostel.branchId);

  const existing = await db.hostelRoom.findFirst({ where: { hostelId: parsed.data.hostelId, roomNumber: parsed.data.roomNumber } });
  if (existing) return { error: "A room with this number already exists in this hostel." };

  const room = await db.hostelRoom.create({ data: parsed.data });
  await recordAudit({ actorId: session.userId, action: "hostel_room.create", entityType: "HostelRoom", entityId: room.id });
  revalidatePath("/admin/hostel");
  return { success: true };
}

export async function deleteHostelRoomAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hostel.manage", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id" };

  const existing = await db.hostelRoom.findUnique({ where: { id }, include: { hostel: true } });
  if (!existing) return { error: "Room not found." };
  assertBranchAccess(session, existing.hostel.branchId);

  const occupied = await db.student.count({ where: { hostelRoomId: id } });
  if (occupied > 0) return { error: `Cannot delete: ${occupied} student(s) are allotted to this room.` };

  await db.hostelRoom.delete({ where: { id } });
  await recordAudit({ actorId: session.userId, action: "hostel_room.delete", entityType: "HostelRoom", entityId: id });
  revalidatePath("/admin/hostel");
  return { success: true };
}

export async function assignHostelRoomAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("hostel.manage", "EDIT");
  const parsed = assignHostelRoomSchema.safeParse({
    studentId: formData.get("studentId"),
    hostelRoomId: formData.get("hostelRoomId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const student = await db.student.findUnique({ where: { id: parsed.data.studentId } });
  if (!student) return { error: "Student not found." };
  assertBranchAccess(session, student.branchId);

  if (parsed.data.hostelRoomId) {
    const room = await db.hostelRoom.findUnique({ where: { id: parsed.data.hostelRoomId }, include: { _count: { select: { students: true } } } });
    if (!room) return { error: "Room not found." };
    if (room._count.students >= room.capacity) return { error: "This room is already at capacity." };
  }

  await db.student.update({ where: { id: parsed.data.studentId }, data: { hostelRoomId: parsed.data.hostelRoomId || null } });
  await recordAudit({ actorId: session.userId, action: "student.assign_hostel_room", entityType: "Student", entityId: parsed.data.studentId });
  revalidatePath(`/admin/sis/students/${parsed.data.studentId}`);
  revalidatePath("/admin/hostel");
  return { success: true };
}
