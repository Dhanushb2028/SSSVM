"use client";

import * as React from "react";
import { useActionState } from "react";
import { LogOut } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { markStaffLeftAction } from "@/server/actions/staff-actions";

type FormState = { error?: string; success?: boolean };

export function MarkStaffLeftDialog({ staffId, staffName }: { staffId: string; staffName: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(markStaffLeftAction, {});
  useCloseOnSuccess(state, () => setOpen(false));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Mark ${staffName} as left`}>
          <LogOut aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent title="Mark staff as left" description={`Record that ${staffName} has left the school.`}>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={staffId} />
          <FormField id="staff-left-date" label="Last working date" required>
            <Input id="staff-left-date" name="leftDate" type="date" required defaultValue={today} />
          </FormField>
          <FormField id="staff-left-reason" label="Reason" required>
            <Input id="staff-left-reason" name="leftReason" required />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Mark as Left"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
