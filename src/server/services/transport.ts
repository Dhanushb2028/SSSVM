import "server-only";
import { db } from "@/lib/db";

export async function listVehicles(branchId: string | null) {
  return db.vehicle.findMany({
    where: { deletedAt: null, ...(branchId ? { branchId } : {}) },
    orderBy: { vehicleNumber: "asc" },
  });
}

export async function listRoutesWithStops(branchId: string | null) {
  const routes = await db.transportRoute.findMany({
    where: { deletedAt: null, ...(branchId ? { branchId } : {}) },
    include: { vehicle: true, stops: { orderBy: { sequence: "asc" }, include: { _count: { select: { students: true } } } } },
    orderBy: { name: "asc" },
  });
  return routes.map((r) => ({
    ...r,
    studentCount: r.stops.reduce((sum, s) => sum + s._count.students, 0),
  }));
}

export async function getRouteWithStops(id: string) {
  return db.transportRoute.findUnique({
    where: { id },
    include: {
      stops: {
        orderBy: { sequence: "asc" },
        include: { students: { where: { deletedAt: null }, orderBy: { firstName: "asc" } } },
      },
    },
  });
}
