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
import { createCircularAction } from "@/server/actions/circular-actions";

type FormState = { error?: string; success?: boolean };
const SCHOOL_WIDE = "__school_wide__";

export function CircularDialog({
  branchId,
  sections,
  allowSchoolWide,
}: {
  branchId: string;
  sections: { id: string; name: string; course: { name: string } }[];
  allowSchoolWide: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createCircularAction, {});
  const [sectionId, setSectionId] = React.useState(allowSchoolWide ? SCHOOL_WIDE : sections[0]?.id ?? "");
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          Post Circular
        </Button>
      </DialogTrigger>
      <DialogContent title="Post Circular">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          <input type="hidden" name="sectionId" value={sectionId === SCHOOL_WIDE ? "" : sectionId} />

          <Select value={sectionId} onValueChange={setSectionId}>
            <FormField id="circ-target" label="Audience" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {allowSchoolWide && <SelectItem value={SCHOOL_WIDE}>Whole school</SelectItem>}
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.course.name} - {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormField id="circ-title" label="Title" required>
            <Input id="circ-title" name="title" required />
          </FormField>
          <FormField id="circ-body" label="Content" required>
            <textarea
              id="circ-body"
              name="body"
              rows={4}
              required
              className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
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
