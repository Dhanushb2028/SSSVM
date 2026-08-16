"use client";

import * as React from "react";
import { useActionState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assignStudentTransportAction } from "@/server/actions/transport-actions";

type FormState = { error?: string; success?: boolean };

const NONE = "__none__";

export function TransportSection({
  studentId,
  routeStopId,
  routeStops,
}: {
  studentId: string;
  routeStopId: string | null;
  routeStops: { id: string; name: string; route: { name: string } }[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(assignStudentTransportAction, {});
  const [selected, setSelected] = React.useState(routeStopId ?? NONE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transport</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="studentId" value={studentId} />
          <input type="hidden" name="routeStopId" value={selected === NONE ? "" : selected} />
          <Select value={selected} onValueChange={setSelected}>
            <FormField id="transport-stop" label="Route stop">
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Not assigned" />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value={NONE}>Not assigned</SelectItem>
              {routeStops.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.route.name} · {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Saving…" : "Save"}
          </Button>
          {state?.success && <span className="text-sm text-success">Saved</span>}
        </form>
        {state?.error && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {state.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
