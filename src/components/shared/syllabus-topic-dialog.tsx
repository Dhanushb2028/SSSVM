"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { createSyllabusTopicAction, updateSyllabusTopicAction } from "@/server/actions/syllabus-actions";

type FormState = { error?: string; success?: boolean };

export function SyllabusTopicDialog({
  mode,
  sectionId,
  subjects,
  topic,
}: {
  mode: "create" | "edit";
  sectionId: string;
  subjects: { id: string; name: string }[];
  topic?: {
    id: string;
    subjectId: string;
    topic: string;
    description: string | null;
    plannedDate: Date;
    completedDate: Date | null;
  };
}) {
  const [open, setOpen] = React.useState(false);
  const action = mode === "create" ? createSyllabusTopicAction : updateSyllabusTopicAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [subjectId, setSubjectId] = React.useState(topic?.subjectId ?? subjects[0]?.id ?? "");
  useCloseOnSuccess(state, () => setOpen(false));

  const toInputDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus aria-hidden="true" />
            Add Topic
          </Button>
        ) : (
          <Button variant="ghost" size="sm" aria-label={`Edit ${topic?.topic}`}>
            <Pencil aria-hidden="true" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={mode === "create" ? "Add Syllabus Topic" : "Edit Syllabus Topic"}>
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "edit" && <input type="hidden" name="id" value={topic?.id} />}
          <input type="hidden" name="sectionId" value={sectionId} />
          <input type="hidden" name="subjectId" value={subjectId} />

          <Select value={subjectId} onValueChange={setSubjectId}>
            <FormField id="topic-subject" label="Subject" required>
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

          <FormField id="topic-name" label="Topic" required>
            <Input id="topic-name" name="topic" required defaultValue={topic?.topic} />
          </FormField>
          <FormField id="topic-desc" label="Description">
            <Input id="topic-desc" name="description" defaultValue={topic?.description ?? ""} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="topic-planned" label="Planned date" required>
              <Input
                id="topic-planned"
                name="plannedDate"
                type="date"
                required
                defaultValue={topic ? toInputDate(topic.plannedDate) : undefined}
              />
            </FormField>
            <FormField id="topic-completed" label="Completed date">
              <Input
                id="topic-completed"
                name="completedDate"
                type="date"
                defaultValue={topic?.completedDate ? toInputDate(topic.completedDate) : undefined}
              />
            </FormField>
          </div>

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
