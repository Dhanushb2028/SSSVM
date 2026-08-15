import "server-only";
import { db } from "@/lib/db";

export async function listHostelsWithRooms(branchId: string | null) {
  const hostels = await db.hostel.findMany({
    where: { deletedAt: null, ...(branchId ? { branchId } : {}) },
    include: {
      warden: true,
      rooms: { include: { _count: { select: { students: true } } }, orderBy: { roomNumber: "asc" } },
    },
    orderBy: { name: "asc" },
  });
  return hostels.map((h) => ({
    ...h,
    capacity: h.rooms.reduce((sum, r) => sum + r.capacity, 0),
    occupied: h.rooms.reduce((sum, r) => sum + r._count.students, 0),
  }));
}
