"use client";

import * as React from "react";
import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  createHostelAction,
  deleteHostelAction,
  createHostelRoomAction,
  deleteHostelRoomAction,
} from "@/server/actions/hostel-actions";

type FormState = { error?: string; success?: boolean };
type Staff = { id: string; firstName: string; lastName: string };

export function HostelForm({ branches, staff }: { branches: { id: string; name: string }[]; staff: Staff[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createHostelAction, {});
  const [branchId, setBranchId] = React.useState(branches[0]?.id ?? "");
  const [wardenId, setWardenId] = React.useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Hostel</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="branchId" value={branchId} />
          <input type="hidden" name="wardenId" value={wardenId} />
          <FormField id="hostel-name" label="Hostel name" required className="w-48">
            <Input id="hostel-name" name="name" required />
          </FormField>
          <Select value={branchId} onValueChange={setBranchId}>
            <FormField id="hostel-branch" label="Branch">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={wardenId} onValueChange={setWardenId}>
            <FormField id="hostel-warden" label="Warden">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="None" />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Adding…" : "Add"}
          </Button>
          {state?.error && (
            <p role="alert" className="w-full text-sm text-danger">
              {state.error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function RoomForm({ hostelId }: { hostelId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createHostelRoomAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="hostelId" value={hostelId} />
      <FormField id={`room-number-${hostelId}`} label="Room number" required className="w-28">
        <Input id={`room-number-${hostelId}`} name="roomNumber" required />
      </FormField>
      <FormField id={`room-capacity-${hostelId}`} label="Capacity" required className="w-24">
        <Input id={`room-capacity-${hostelId}`} name="capacity" type="number" min={1} required />
      </FormField>
      <Button type="submit" disabled={pending} size="sm" variant="secondary">
        {pending ? "Adding…" : "Add Room"}
      </Button>
      {state?.error && (
        <p role="alert" className="w-full text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}

type Room = { id: string; roomNumber: string; capacity: number; _count: { students: number } };
type Hostel = {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  warden: { firstName: string; lastName: string } | null;
  rooms: Room[];
};

export function HostelsList({ hostels }: { hostels: Hostel[] }) {
  if (hostels.length === 0) {
    return <p className="text-sm text-muted-foreground">No hostels yet.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {hostels.map((h) => (
        <Card key={h.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              {h.name}
              <StatusBadge tone={h.occupied >= h.capacity && h.capacity > 0 ? "warning" : "neutral"}>
                {h.occupied} / {h.capacity} occupied
              </StatusBadge>
            </CardTitle>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Delete ${h.name}`}>
                  <Trash2 aria-hidden="true" className="text-danger" />
                </Button>
              }
              title="Delete hostel"
              description={`Delete "${h.name}"? This is blocked if any student is still allotted a room here.`}
              confirmLabel="Delete"
              action={deleteHostelAction}
              hiddenFields={{ id: h.id }}
            />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {h.warden && <p className="text-sm text-muted-foreground">Warden: {h.warden.firstName} {h.warden.lastName}</p>}
            <RoomForm hostelId={h.id} />
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[360px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Room</th>
                    <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Occupancy</th>
                    <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {h.rooms.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-3 text-center text-muted-foreground">
                        No rooms yet.
                      </td>
                    </tr>
                  )}
                  {h.rooms.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">{r.roomNumber}</td>
                      <td className="px-3 py-2">
                        {r._count.students} / {r.capacity}
                      </td>
                      <td className="px-3 py-2">
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="sm" aria-label={`Delete room ${r.roomNumber}`}>
                              <Trash2 aria-hidden="true" className="text-danger" />
                            </Button>
                          }
                          title="Delete room"
                          description={`Delete room "${r.roomNumber}"? This is blocked if any student is still allotted to it.`}
                          confirmLabel="Delete"
                          action={deleteHostelRoomAction}
                          hiddenFields={{ id: r.id }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
