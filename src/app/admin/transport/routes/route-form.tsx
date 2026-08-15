"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createRouteAction, updateRouteAction } from "@/server/actions/transport-actions";

type FormState = { error?: string; success?: boolean };
type StopRow = { id?: string; name: string; pickupTime: string; sequence: number };

export function RouteForm({
  mode,
  branchId,
  vehicles,
  route,
}: {
  mode: "create" | "edit";
  branchId: string;
  vehicles: { id: string; vehicleNumber: string }[];
  route?: { id: string; name: string; vehicleId: string | null; monthlyFee: number; stops: StopRow[] };
}) {
  const action = mode === "create" ? createRouteAction : updateRouteAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [vehicleId, setVehicleId] = React.useState(route?.vehicleId ?? "");
  const [rows, setRows] = React.useState<StopRow[]>(
    route?.stops.length ? route.stops : [{ name: "", pickupTime: "", sequence: 0 }],
  );

  const stopsJson = JSON.stringify(rows.filter((r) => r.name && r.pickupTime));

  function updateRow(index: number, patch: Partial<StopRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {mode === "edit" && <input type="hidden" name="id" value={route?.id} />}
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="hidden" name="stops" value={stopsJson} />

      <Card>
        <CardHeader>
          <CardTitle>Route details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="route-name" label="Route name" required>
            <Input id="route-name" name="name" required defaultValue={route?.name} />
          </FormField>
          <Select value={vehicleId} onValueChange={setVehicleId}>
            <FormField id="route-vehicle" label="Vehicle">
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.vehicleNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormField id="route-fee" label="Monthly fee">
            <Input id="route-fee" name="monthlyFee" type="number" min={0} defaultValue={route?.monthlyFee ?? 0} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Stops</CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setRows((prev) => [...prev, { name: "", pickupTime: "", sequence: prev.length }])}
          >
            <Plus aria-hidden="true" />
            Add Stop
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <div key={row.id ?? i} className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-4 sm:items-end">
              <FormField id={`stop-name-${i}`} label="Stop name">
                <Input id={`stop-name-${i}`} value={row.name} onChange={(e) => updateRow(i, { name: e.target.value })} />
              </FormField>
              <FormField id={`stop-time-${i}`} label="Pickup time">
                <Input id={`stop-time-${i}`} placeholder="07:15 AM" value={row.pickupTime} onChange={(e) => updateRow(i, { pickupTime: e.target.value })} />
              </FormField>
              <FormField id={`stop-seq-${i}`} label="Sequence">
                <Input id={`stop-seq-${i}`} type="number" value={row.sequence} onChange={(e) => updateRow(i, { sequence: Number(e.target.value) })} />
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Remove stop"
                onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={rows.length === 1}
              >
                <Trash2 aria-hidden="true" className="text-danger" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : mode === "create" ? "Create Route" : "Save changes"}
      </Button>
    </form>
  );
}
