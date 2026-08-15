"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createFeeComponentAction, deleteFeeComponentAction } from "@/server/actions/fee-component-actions";

type FormState = { error?: string; success?: boolean };
const CATEGORIES = ["TUITION", "TRANSPORT", "HOSTEL", "BOOKS", "UNIFORM", "OTHER"] as const;

export function FeeComponentForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createFeeComponentAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <FormField id="fc-name" label="Component name" required className="w-48">
        <Input id="fc-name" name="name" required placeholder="e.g. Tuition Fee" />
      </FormField>
      <Select name="category" defaultValue="TUITION">
        <FormField id="fc-category" label="Category">
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
        </FormField>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c[0] + c.slice(1).toLowerCase()}
            </SelectItem>
          ))}
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

export function FeeComponentList({ items }: { items: { id: string; name: string; category: string }[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.length === 0 && <li className="text-sm text-muted-foreground">None yet.</li>}
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
          <span>
            {item.name} <span className="text-muted-foreground">({item.category})</span>
          </span>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" aria-label={`Delete ${item.name}`}>
                <Trash2 aria-hidden="true" className="text-danger" />
              </Button>
            }
            title={`Delete ${item.name}`}
            description={`Delete "${item.name}"? Existing fee structure rows referencing it will remain but the component won't be selectable anymore.`}
            confirmLabel="Delete"
            action={deleteFeeComponentAction}
            hiddenFields={{ id: item.id }}
          />
        </li>
      ))}
    </ul>
  );
}
