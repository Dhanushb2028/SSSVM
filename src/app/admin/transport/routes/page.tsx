import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePermissionOrRedirect, hasPermission } from "@/lib/rbac/permissions";
import { listRoutesWithStops } from "@/server/services/transport";
import { Button } from "@/components/ui/button";
import { RoutesList } from "./routes-list";

export default async function RoutesPage() {
  const session = await requirePermissionOrRedirect("transport.routes", "VIEW");
  const routes = await listRoutesWithStops(session.branchId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Routes &amp; Stops</h1>
          <p className="text-sm text-muted-foreground">Transport routes, their stops, and assigned student counts.</p>
        </div>
        {hasPermission(session, "transport.routes", "CREATE") && (
          <Button asChild size="sm">
            <Link href="/admin/transport/routes/new">
              <Plus aria-hidden="true" />
              Add Route
            </Link>
          </Button>
        )}
      </div>
      <RoutesList routes={routes} canEdit={hasPermission(session, "transport.routes", "EDIT")} canDelete={hasPermission(session, "transport.routes", "DELETE")} />
    </div>
  );
}
