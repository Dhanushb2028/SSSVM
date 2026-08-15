"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { createExpenseAction } from "@/server/actions/expense-actions";

type FormState = { error?: string; success?: boolean };

export function ExpenseFormDialog({ branchId }: { branchId: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createExpenseAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent title="Add Expense">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          <FormField id="exp-desc" label="Description" required>
            <Input id="exp-desc" name="description" required />
          </FormField>
          <FormField id="exp-category" label="Category">
            <Input id="exp-category" name="category" placeholder="e.g. Maintenance" />
          </FormField>
          <FormField id="exp-amount" label="Amount" required>
            <Input id="exp-amount" name="amount" type="number" min={1} step="0.01" required />
          </FormField>
          <FormField id="exp-date" label="Date" required>
            <Input id="exp-date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
