"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createCompetitiveExamAction, deleteCompetitiveExamAction } from "@/server/actions/competitive-exam-actions";

type FormState = { error?: string; success?: boolean };

export function CompetitiveExamForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createCompetitiveExamAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <FormField id="ce-name" label="Name" required className="w-56">
        <Input id="ce-name" name="name" required placeholder="e.g. NEET Mock Test" />
      </FormField>
      <FormField id="ce-date" label="Date">
        <Input id="ce-date" name="examDate" type="date" />
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

export function CompetitiveExamList({ items }: { items: { id: string; name: string; markCount: number }[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.length === 0 && <li className="text-sm text-muted-foreground">None yet.</li>}
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
          <Link href={`/admin/exams/competitive/${item.id}`} className="font-medium text-primary hover:underline">
            {item.name}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{item.markCount} mark(s)</span>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Delete ${item.name}`}>
                  <Trash2 aria-hidden="true" className="text-danger" />
                </Button>
              }
              title={`Delete ${item.name}`}
              description={`Delete "${item.name}" and all its marks? This can't be undone.`}
              confirmLabel="Delete"
              action={deleteCompetitiveExamAction}
              hiddenFields={{ id: item.id }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
