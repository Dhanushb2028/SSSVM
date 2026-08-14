"use client";

import * as React from "react";
import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  createCourseAction,
  deleteCourseAction,
  createSubjectAction,
  deleteSubjectAction,
} from "@/server/actions/master-data-actions";

type FormState = { error?: string; success?: boolean };

export function CourseForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createCourseAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <FormField id="course-name" label="Course name" required className="w-40">
        <Input id="course-name" name="name" required placeholder="e.g. Grade 8" />
      </FormField>
      <FormField id="course-order" label="Order" className="w-24">
        <Input id="course-order" name="orderIndex" type="number" defaultValue={0} />
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

export function SubjectForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createSubjectAction, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <FormField id="subject-name" label="Subject name" required className="w-40">
        <Input id="subject-name" name="name" required placeholder="e.g. Computer Science" />
      </FormField>
      <FormField id="subject-code" label="Code" className="w-24">
        <Input id="subject-code" name="code" />
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

export function MasterDataList({
  kind,
  items,
}: {
  kind: "course" | "subject";
  items: { id: string; name: string; extra?: string; usageCount: number }[];
}) {
  const action = kind === "course" ? deleteCourseAction : deleteSubjectAction;
  return (
    <ul className="flex flex-col gap-1">
      {items.length === 0 && <li className="text-sm text-muted-foreground">None yet.</li>}
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
          <span>
            {item.name}
            {item.extra && <span className="text-muted-foreground"> ({item.extra})</span>}
          </span>
          <div className="flex items-center gap-2">
            {item.usageCount > 0 && <StatusBadge tone="neutral">In use</StatusBadge>}
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Delete ${item.name}`}>
                  <Trash2 aria-hidden="true" className="text-danger" />
                </Button>
              }
              title={`Delete ${item.name}`}
              description={
                item.usageCount > 0
                  ? `"${item.name}" is currently used by ${item.usageCount} section(s) and can't be deleted.`
                  : `Delete "${item.name}"? This can't be undone.`
              }
              confirmLabel="Delete"
              action={action}
              hiddenFields={{ id: item.id }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
