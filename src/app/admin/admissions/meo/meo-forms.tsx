"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createMeoAction, deleteMeoAction } from "@/server/actions/meo-actions";

type FormState = { error?: string; success?: boolean };

export function MeoForm({ branchId }: { branchId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createMeoAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="branchId" value={branchId} />
      <FormField id="meo-first" label="First name" required className="w-36">
        <Input id="meo-first" name="firstName" required />
      </FormField>
      <FormField id="meo-last" label="Last name" required className="w-36">
        <Input id="meo-last" name="lastName" required />
      </FormField>
      <FormField id="meo-phone" label="Phone" required className="w-36">
        <Input id="meo-phone" name="phone" required />
      </FormField>
      <FormField id="meo-email" label="Email" className="w-48">
        <Input id="meo-email" name="email" type="email" />
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

export function MeoList({ items }: { items: { id: string; firstName: string; lastName: string; phone: string; email: string | null }[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.length === 0 && <li className="text-sm text-muted-foreground">None yet.</li>}
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
          <span>{item.firstName} {item.lastName} · {item.phone}{item.email ? ` · ${item.email}` : ""}</span>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" aria-label={`Delete ${item.firstName}`}>
                <Trash2 aria-hidden="true" className="text-danger" />
              </Button>
            }
            title={`Delete ${item.firstName} ${item.lastName}`}
            description="Delete this marketing/enrollment officer?"
            confirmLabel="Delete"
            action={deleteMeoAction}
            hiddenFields={{ id: item.id }}
          />
        </li>
      ))}
    </ul>
  );
}
