"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { createBankTransactionAction } from "@/server/actions/banking-actions";

type FormState = { error?: string; success?: boolean };

export function BankTransactionFormDialog({ branchId }: { branchId: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createBankTransactionAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent title="New Bank Transaction">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          <Select name="type" defaultValue="DEPOSIT">
            <FormField id="bt-type" label="Type" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value="DEPOSIT">Deposit</SelectItem>
              <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
              <SelectItem value="RECEIVE">Receive</SelectItem>
              <SelectItem value="PAY">Pay</SelectItem>
              <SelectItem value="LOAN">Loan</SelectItem>
            </SelectContent>
          </Select>
          <FormField id="bt-amount" label="Amount" required>
            <Input id="bt-amount" name="amount" type="number" min={1} step="0.01" required />
          </FormField>
          <FormField id="bt-date" label="Date" required>
            <Input id="bt-date" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
          </FormField>
          <FormField id="bt-desc" label="Description">
            <Input id="bt-desc" name="description" />
          </FormField>
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
