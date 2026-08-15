import { notFound } from "next/navigation";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { db } from "@/lib/db";
import { getRouteWithStops } from "@/server/services/transport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteForm } from "../route-form";

export default async function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermissionOrRedirect("transport.routes", "EDIT");
  const { id } = await params;
  const route = await getRouteWithStops(id);
  if (!route) notFound();
  assertBranchAccess(session, route.branchId);

  const vehicles = await db.vehicle.findMany({ where: { branchId: route.branchId, deletedAt: null }, orderBy: { vehicleNumber: "asc" } });

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit Route</h1>
      </div>
      <RouteForm mode="edit" branchId={route.branchId} vehicles={vehicles} route={route} />

      <Card>
        <CardHeader>
          <CardTitle>Assigned students per stop</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {route.stops.every((s) => s.students.length === 0) ? (
            <p className="text-sm text-muted-foreground">
              No students assigned yet. Assign transport from a student&apos;s profile page (Student Master).
            </p>
          ) : (
            route.stops.map((s) => (
              <div key={s.id} className="text-sm">
                <p className="font-medium text-foreground">
                  {s.name} <span className="font-normal text-muted-foreground">({s.students.length})</span>
                </p>
                <p className="text-muted-foreground">
                  {s.students.length > 0 ? s.students.map((st) => `${st.firstName} ${st.lastName}`).join(", ") : "None"}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
