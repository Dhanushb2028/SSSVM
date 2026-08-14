"use client";

import * as React from "react";
import { useActionState } from "react";
import { LogOut } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { markStudentLeftAction } from "@/server/actions/student-actions";

type FormState = { error?: string; success?: boolean };

export function MarkLeftDialog({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(markStudentLeftAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <LogOut aria-hidden="true" />
          Mark as Left
        </Button>
      </DialogTrigger>
      <DialogContent title="Mark student as left" description={`Record that ${studentName} has left the school.`}>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={studentId} />
          <FormField id="leave-reason" label="Reason (optional)">
            <Input id="leave-reason" name="reason" />
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
