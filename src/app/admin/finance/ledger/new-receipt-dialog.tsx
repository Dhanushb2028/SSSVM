"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { createFeeTransactionAction } from "@/server/actions/fee-transaction-actions";

type FormState = { error?: string; success?: boolean };

export function NewReceiptDialog({ studentId, academicYearId }: { studentId: string; academicYearId: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createFeeTransactionAction, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          New Receipt
        </Button>
      </DialogTrigger>
      <DialogContent title="Record Fee Payment">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="studentId" value={studentId} />
          <input type="hidden" name="academicYearId" value={academicYearId} />
          <FormField id="ft-amount" label="Amount" required>
            <Input id="ft-amount" name="amount" type="number" min={1} step="0.01" required />
          </FormField>
          <Select name="mode" defaultValue="CASH">
            <FormField id="ft-mode" label="Payment mode" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
              <SelectItem value="ONLINE">Online</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
            </SelectContent>
          </Select>
          <FormField id="ft-date" label="Date" required>
            <Input id="ft-date" name="paidDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
          </FormField>
          <FormField id="ft-remarks" label="Remarks">
            <Input id="ft-remarks" name="remarks" />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
