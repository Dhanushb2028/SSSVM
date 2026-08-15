import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { RouteForm } from "../route-form";

export default async function NewRoutePage() {
  const session = await requirePermissionOrRedirect("transport.routes", "CREATE");
  const branch = session.branchId
    ? await db.branch.findUnique({ where: { id: session.branchId } })
    : await db.branch.findFirst({ where: { deletedAt: null } });
  const vehicles = branch ? await db.vehicle.findMany({ where: { branchId: branch.id, deletedAt: null }, orderBy: { vehicleNumber: "asc" } }) : [];

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Add Route</h1>
      </div>
      {branch ? <RouteForm mode="create" branchId={branch.id} vehicles={vehicles} /> : <p className="text-sm text-muted-foreground">No branch available.</p>}
    </div>
  );
}
