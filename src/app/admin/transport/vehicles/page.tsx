import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { listVehicles } from "@/server/services/transport";
import { VehiclesTable } from "./vehicles-table";

export default async function VehiclesPage() {
  const session = await requirePermissionOrRedirect("transport.vehicles", "VIEW");
  const [vehicles, branches] = await Promise.all([
    listVehicles(session.branchId),
    db.branch.findMany({ where: { deletedAt: null, ...(session.branchId ? { id: session.branchId } : {}) }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Vehicles</h1>
        <p className="text-sm text-muted-foreground">Buses/vans used for student transport.</p>
      </div>
      <VehiclesTable vehicles={vehicles} branches={branches} />
    </div>
  );
}
