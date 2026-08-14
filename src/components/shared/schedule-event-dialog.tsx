"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { createScheduleEventAction } from "@/server/actions/schedule-actions";

type FormState = { error?: string; success?: boolean };

export function ScheduleEventDialog({ branchId }: { branchId: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createScheduleEventAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent title="Add School Calendar Event">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          <FormField id="event-title" label="Title" required>
            <Input id="event-title" name="title" required />
          </FormField>
          <FormField id="event-desc" label="Description">
            <Input id="event-desc" name="description" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="event-start" label="Start date" required>
              <Input id="event-start" name="startDate" type="date" required />
            </FormField>
            <FormField id="event-end" label="End date">
              <Input id="event-end" name="endDate" type="date" />
            </FormField>
          </div>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
