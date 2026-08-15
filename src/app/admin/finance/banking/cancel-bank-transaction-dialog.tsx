"use client";

import * as React from "react";
import { useActionState } from "react";
import { Ban } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { cancelBankTransactionAction } from "@/server/actions/banking-actions";

type FormState = { error?: string; success?: boolean };

export function CancelBankTransactionDialog({ id }: { id: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(cancelBankTransactionAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Cancel transaction">
          <Ban aria-hidden="true" className="text-danger" />
        </Button>
      </DialogTrigger>
      <DialogContent title="Cancel transaction" description="This is recorded in the audit log and can't be undone.">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={id} />
          <FormField id="bt-cancel-reason" label="Reason" required>
            <Input id="bt-cancel-reason" name="reason" required />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" variant="danger" disabled={pending}>
              {pending ? "Cancelling…" : "Cancel Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
