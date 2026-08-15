import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { listHostelsWithRooms } from "@/server/services/hostel";
import { HostelForm, HostelsList } from "./hostel-forms";

export default async function HostelPage() {
  const session = await requirePermissionOrRedirect("hostel.manage", "VIEW");
  const [hostels, branches, staff] = await Promise.all([
    listHostelsWithRooms(session.branchId),
    db.branch.findMany({ where: { deletedAt: null, ...(session.branchId ? { id: session.branchId } : {}) }, orderBy: { name: "asc" } }),
    db.staffMember.findMany({ where: { deletedAt: null, status: "ACTIVE", ...(session.branchId ? { branchId: session.branchId } : {}) }, orderBy: { firstName: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Hostel</h1>
        <p className="text-sm text-muted-foreground">Hostel buildings, rooms, and occupancy. Allot students from their profile page.</p>
      </div>
      <HostelForm branches={branches} staff={staff} />
      <HostelsList hostels={hostels} />
    </div>
  );
}
