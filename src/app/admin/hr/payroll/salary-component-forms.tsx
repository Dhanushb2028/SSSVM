"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createSalaryComponentAction, deleteSalaryComponentAction } from "@/server/actions/payroll-actions";

type FormState = { error?: string; success?: boolean };

export function SalaryComponentForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createSalaryComponentAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <FormField id="sc-name" label="Component name" required className="w-48">
        <Input id="sc-name" name="name" required placeholder="e.g. Basic Pay" />
      </FormField>
      <Select name="type" defaultValue="EARNING">
        <FormField id="sc-type" label="Type">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
        </FormField>
        <SelectContent>
          <SelectItem value="EARNING">Earning</SelectItem>
          <SelectItem value="DEDUCTION">Deduction</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Adding…" : "Add"}
      </Button>
      {state?.error && (
        <p role="alert" className="w-full text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function SalaryComponentList({ items }: { items: { id: string; name: string; type: string }[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.length === 0 && <li className="text-sm text-muted-foreground">None yet.</li>}
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
          <span>
            {item.name} <span className="text-muted-foreground">({item.type === "EARNING" ? "Earning" : "Deduction"})</span>
          </span>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" aria-label={`Delete ${item.name}`}>
                <Trash2 aria-hidden="true" className="text-danger" />
              </Button>
            }
            title={`Delete ${item.name}`}
            description={`Delete "${item.name}"? Existing salary structure rows referencing it will remain but the component won't be selectable anymore.`}
            confirmLabel="Delete"
            action={deleteSalaryComponentAction}
            hiddenFields={{ id: item.id }}
          />
        </li>
      ))}
    </ul>
  );
}
