"use client";

import * as React from "react";
import { useActionState } from "react";
import { FileCheck2 } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { issueTcAction } from "@/server/actions/tc-actions";

type FormState = { error?: string; success?: boolean };

export function IssueTcDialog({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(issueTcAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FileCheck2 aria-hidden="true" />
          Issue TC
        </Button>
      </DialogTrigger>
      <DialogContent title="Issue Transfer Certificate" description={`Issue a TC for ${studentName}.`}>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="studentId" value={studentId} />
          <FormField id="tc-number" label="TC Number" required hint="Format: TC-1234">
            <Input
              id="tc-number"
              name="tcNumber"
              required
              pattern="[A-Za-z]{2,}-\d{3,}"
              title="Letters, a hyphen, then at least 3 digits — e.g. TC-1234"
              placeholder="TC-1234"
            />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Issuing…" : "Issue TC"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
