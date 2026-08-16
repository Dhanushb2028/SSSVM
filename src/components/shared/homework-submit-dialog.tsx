"use client";

import * as React from "react";
import { useActionState } from "react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { submitHomeworkAction } from "@/server/actions/homework-actions";

type FormState = { error?: string; success?: boolean };

export function HomeworkSubmitDialog({ homeworkId, alreadySubmitted }: { homeworkId: string; alreadySubmitted: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(submitHomeworkAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={alreadySubmitted ? "secondary" : "primary"}>
          {alreadySubmitted ? "Resubmit" : "Submit"}
        </Button>
      </DialogTrigger>
      <DialogContent title="Submit Homework">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="homeworkId" value={homeworkId} />
          <FormField id="submit-file" label="File">
            <Input id="submit-file" name="attachment" type="file" />
          </FormField>
          <FormField id="submit-remarks" label="Notes">
            <Input id="submit-remarks" name="remarks" />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
