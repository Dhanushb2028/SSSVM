"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { vehicleSchema, saveRouteSchema, assignStudentTransportSchema } from "@/lib/validation/transport";
import { recordAudit } from "@/server/services/audit";

type FormState = { error?: string; success?: boolean };

export async function createVehicleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("transport.vehicles", "CREATE");
  const parsed = vehicleSchema.safeParse({
    branchId: formData.get("branchId"),
    vehicleNumber: formData.get("vehicleNumber"),
    capacity: formData.get("capacity"),
    driverName: formData.get("driverName"),
    driverPhone: formData.get("driverPhone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const existing = await db.vehicle.findFirst({ where: { branchId: parsed.data.branchId, vehicleNumber: parsed.data.vehicleNumber, deletedAt: null } });
  if (existing) return { error: "A vehicle with this number already exists." };

  const vehicle = await db.vehicle.create({ data: parsed.data });
  await recordAudit({ actorId: session.userId, action: "vehicle.create", entityType: "Vehicle", entityId: vehicle.id });
  revalidatePath("/admin/transport/vehicles");
  return { success: true };
}

export async function deleteVehicleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("transport.vehicles", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id" };

  const existing = await db.vehicle.findUnique({ where: { id } });
  if (!existing) return { error: "Vehicle not found." };
  assertBranchAccess(session, existing.branchId);

  await db.vehicle.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAudit({ actorId: session.userId, action: "vehicle.delete", entityType: "Vehicle", entityId: id });
  revalidatePath("/admin/transport/vehicles");
  return { success: true };
}

function toRouteData(formData: FormData) {
  let stops: unknown = [];
  try {
    stops = JSON.parse(String(formData.get("stops") ?? "[]"));
  } catch {
    stops = [];
  }
  return saveRouteSchema.safeParse({
    branchId: formData.get("branchId"),
    name: formData.get("name"),
    vehicleId: formData.get("vehicleId"),
    monthlyFee: formData.get("monthlyFee"),
    stops,
  });
}

export async function createRouteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("transport.routes", "CREATE");
  const parsed = toRouteData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const existing = await db.transportRoute.findFirst({ where: { branchId: parsed.data.branchId, name: parsed.data.name, deletedAt: null } });
  if (existing) return { error: "A route with this name already exists." };

  const route = await db.transportRoute.create({
    data: {
      branchId: parsed.data.branchId,
      name: parsed.data.name,
      vehicleId: parsed.data.vehicleId || null,
      monthlyFee: parsed.data.monthlyFee,
      stops: { create: parsed.data.stops.map((s) => ({ name: s.name, pickupTime: s.pickupTime, sequence: s.sequence })) },
    },
  });
  await recordAudit({ actorId: session.userId, action: "route.create", entityType: "TransportRoute", entityId: route.id });
  revalidatePath("/admin/transport/routes");
  redirect("/admin/transport/routes");
}

export async function updateRouteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("transport.routes", "EDIT");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing route id" };

  const existing = await db.transportRoute.findUnique({ where: { id } });
  if (!existing) return { error: "Route not found." };
  assertBranchAccess(session, existing.branchId);

  const parsed = toRouteData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  assertBranchAccess(session, parsed.data.branchId);

  const existingStops = await db.routeStop.findMany({ where: { routeId: id } });
  const keepIds = new Set(parsed.data.stops.filter((s) => s.id).map((s) => s.id));
  const toRemove = existingStops.filter((s) => !keepIds.has(s.id));
  if (toRemove.length > 0) {
    const assignedCount = await db.student.count({ where: { routeStopId: { in: toRemove.map((s) => s.id) } } });
    if (assignedCount > 0) return { error: `Cannot remove a stop with ${assignedCount} student(s) still assigned to it. Reassign them first.` };
  }

  await db.$transaction(async (tx) => {
    await tx.transportRoute.update({
      where: { id },
      data: { name: parsed.data.name, vehicleId: parsed.data.vehicleId || null, monthlyFee: parsed.data.monthlyFee },
    });
    if (toRemove.length > 0) {
      await tx.routeStop.deleteMany({ where: { id: { in: toRemove.map((s) => s.id) } } });
    }
    for (const s of parsed.data.stops) {
      if (s.id) {
        await tx.routeStop.update({ where: { id: s.id }, data: { name: s.name, pickupTime: s.pickupTime, sequence: s.sequence } });
      } else {
        await tx.routeStop.create({ data: { routeId: id, name: s.name, pickupTime: s.pickupTime, sequence: s.sequence } });
      }
    }
  });

  await recordAudit({ actorId: session.userId, action: "route.update", entityType: "TransportRoute", entityId: id });
  revalidatePath("/admin/transport/routes");
  return { success: true };
}

export async function deleteRouteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("transport.routes", "DELETE");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing route id" };

  const existing = await db.transportRoute.findUnique({ where: { id } });
  if (!existing) return { error: "Route not found." };
  assertBranchAccess(session, existing.branchId);

  const assignedCount = await db.student.count({ where: { routeStop: { routeId: id } } });
  if (assignedCount > 0) return { error: `Cannot delete: ${assignedCount} student(s) are assigned to this route.` };

  await db.$transaction([
    db.routeStop.deleteMany({ where: { routeId: id } }),
    db.transportRoute.update({ where: { id }, data: { deletedAt: new Date() } }),
  ]);
  await recordAudit({ actorId: session.userId, action: "route.delete", entityType: "TransportRoute", entityId: id });
  revalidatePath("/admin/transport/routes");
  return { success: true };
}

export async function assignStudentTransportAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requirePermission("transport.routes", "EDIT");
  const parsed = assignStudentTransportSchema.safeParse({
    studentId: formData.get("studentId"),
    routeStopId: formData.get("routeStopId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const student = await db.student.findUnique({ where: { id: parsed.data.studentId } });
  if (!student) return { error: "Student not found." };
  assertBranchAccess(session, student.branchId);

  await db.student.update({ where: { id: parsed.data.studentId }, data: { routeStopId: parsed.data.routeStopId || null } });
  await recordAudit({ actorId: session.userId, action: "student.assign_transport", entityType: "Student", entityId: parsed.data.studentId });
  revalidatePath(`/admin/sis/students/${parsed.data.studentId}`);
  revalidatePath("/admin/transport/routes");
  return { success: true };
}
