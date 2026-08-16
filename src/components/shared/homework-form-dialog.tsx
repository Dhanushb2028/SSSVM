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
import { createHomeworkAction } from "@/server/actions/homework-actions";

type FormState = { error?: string; success?: boolean };

export function HomeworkFormDialog({ sectionId, subjects }: { sectionId: string; subjects: { id: string; name: string }[] }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createHomeworkAction, {});
  const [subjectId, setSubjectId] = React.useState(subjects[0]?.id ?? "");
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          Post Homework
        </Button>
      </DialogTrigger>
      <DialogContent title="Post Homework">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="sectionId" value={sectionId} />
          <input type="hidden" name="subjectId" value={subjectId} />

          <Select value={subjectId} onValueChange={setSubjectId}>
            <FormField id="hw-subject" label="Subject" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormField id="hw-desc" label="Description" required>
            <textarea
              id="hw-desc"
              name="description"
              rows={4}
              required
              className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField id="hw-due" label="Due date" required>
            <Input id="hw-due" name="dueDate" type="date" required />
          </FormField>
          <FormField id="hw-files" label="Attachments">
            <Input id="hw-files" name="attachments" type="file" multiple />
          </FormField>

          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
