"use client";

import * as React from "react";
import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createVehicleAction, deleteVehicleAction } from "@/server/actions/transport-actions";

type FormState = { error?: string; success?: boolean };
type Vehicle = { id: string; vehicleNumber: string; capacity: number; driverName: string; driverPhone: string };

function VehicleForm({ branchId }: { branchId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createVehicleAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="branchId" value={branchId} />
      <FormField id="v-number" label="Vehicle number" required className="w-40">
        <Input id="v-number" name="vehicleNumber" required />
      </FormField>
      <FormField id="v-capacity" label="Capacity" required className="w-24">
        <Input id="v-capacity" name="capacity" type="number" min={1} required />
      </FormField>
      <FormField id="v-driver" label="Driver name" required className="w-40">
        <Input id="v-driver" name="driverName" required />
      </FormField>
      <FormField id="v-phone" label="Driver phone" required className="w-36">
        <Input id="v-phone" name="driverPhone" required />
      </FormField>
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Adding…" : "Add"}
      </Button>
      {state?.error && (
        <p role="alert" className="w-full text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function VehiclesTable({ vehicles, branches }: { vehicles: Vehicle[]; branches: { id: string; name: string }[] }) {
  const branchId = branches[0]?.id ?? "";
  return (
    <div className="flex flex-col gap-4">
      {branchId ? <VehicleForm branchId={branchId} /> : <p className="text-sm text-muted-foreground">No branch available.</p>}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Vehicle No.</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Capacity</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Driver</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Driver Phone</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                  No vehicles yet.
                </td>
              </tr>
            )}
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">{v.vehicleNumber}</td>
                <td className="px-3 py-2">{v.capacity}</td>
                <td className="px-3 py-2">{v.driverName}</td>
                <td className="px-3 py-2">{v.driverPhone}</td>
                <td className="px-3 py-2">
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="sm" aria-label={`Delete ${v.vehicleNumber}`}>
                        <Trash2 aria-hidden="true" className="text-danger" />
                      </Button>
                    }
                    title="Delete vehicle"
                    description={`Delete vehicle "${v.vehicleNumber}"?`}
                    confirmLabel="Delete"
                    action={deleteVehicleAction}
                    hiddenFields={{ id: v.id }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
