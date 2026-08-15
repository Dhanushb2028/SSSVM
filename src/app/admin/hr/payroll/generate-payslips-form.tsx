"use client";

import { useActionState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { generatePayslipsAction } from "@/server/actions/payroll-actions";

type FormState = { error?: string; success?: boolean };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function GeneratePayslipsForm({ branchId }: { branchId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(generatePayslipsAction, {});
  const now = new Date();

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="branchId" value={branchId} />
      <Select name="month" defaultValue={String(now.getMonth() + 1)}>
        <FormField id="payslip-month" label="Month">
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
        </FormField>
        <SelectContent>
          {MONTHS.map((m, i) => (
            <SelectItem key={m} value={String(i + 1)}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormField id="payslip-year" label="Year">
        <Input id="payslip-year" name="year" type="number" defaultValue={now.getFullYear()} className="w-24" />
      </FormField>
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Generating…" : "Generate Payslips"}
      </Button>
      {state?.error && (
        <p role="alert" className="w-full text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.success && <span className="text-sm text-success">Generated</span>}
    </form>
  );
}
