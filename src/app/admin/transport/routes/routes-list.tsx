"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { deleteRouteAction } from "@/server/actions/transport-actions";

type Route = {
  id: string;
  name: string;
  monthlyFee: number;
  studentCount: number;
  vehicle: { vehicleNumber: string } | null;
  stops: { id: string; name: string; pickupTime: string }[];
};

export function RoutesList({ routes, canEdit, canDelete }: { routes: Route[]; canEdit: boolean; canDelete: boolean }) {
  if (routes.length === 0) {
    return <p className="text-sm text-muted-foreground">No routes yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {routes.map((r) => (
        <Card key={r.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              {r.name}
              <StatusBadge tone="neutral">{r.studentCount} student(s)</StatusBadge>
            </CardTitle>
            <div className="flex items-center gap-1">
              {canEdit && (
                <Button asChild variant="ghost" size="sm" aria-label={`Edit ${r.name}`}>
                  <Link href={`/admin/transport/routes/${r.id}`}>
                    <Pencil aria-hidden="true" />
                  </Link>
                </Button>
              )}
              {canDelete && (
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="sm" aria-label={`Delete ${r.name}`}>
                      <Trash2 aria-hidden="true" className="text-danger" />
                    </Button>
                  }
                  title="Delete route"
                  description={`Delete "${r.name}"? This is blocked if any student is still assigned to one of its stops.`}
                  confirmLabel="Delete"
                  action={deleteRouteAction}
                  hiddenFields={{ id: r.id }}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p>
              Vehicle: {r.vehicle?.vehicleNumber ?? "—"} · Monthly fee: ₹{r.monthlyFee}
            </p>
            <p>Stops: {r.stops.map((s) => `${s.name} (${s.pickupTime})`).join(", ") || "None"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
