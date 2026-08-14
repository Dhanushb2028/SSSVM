"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createExamTypeAction, deleteExamTypeAction } from "@/server/actions/exam-type-actions";

type FormState = { error?: string; success?: boolean };

export function ExamTypeForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createExamTypeAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <FormField id="exam-type-name" label="Name" required className="w-52">
        <Input id="exam-type-name" name="name" required placeholder="e.g. Mid-Term" />
      </FormField>
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

export function ExamTypeList({ items }: { items: { id: string; name: string; usageCount: number }[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.length === 0 && <li className="text-sm text-muted-foreground">None yet.</li>}
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
          <span>{item.name}</span>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" aria-label={`Delete ${item.name}`}>
                <Trash2 aria-hidden="true" className="text-danger" />
              </Button>
            }
            title={`Delete ${item.name}`}
            description={
              item.usageCount > 0
                ? `"${item.name}" is used by ${item.usageCount} exam(s) and can't be deleted.`
                : `Delete "${item.name}"?`
            }
            confirmLabel="Delete"
            action={deleteExamTypeAction}
            hiddenFields={{ id: item.id }}
          />
        </li>
      ))}
    </ul>
  );
}
