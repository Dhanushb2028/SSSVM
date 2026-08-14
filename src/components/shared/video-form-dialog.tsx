"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { createVideoAction } from "@/server/actions/gallery-actions";

type FormState = { error?: string; success?: boolean };

export function VideoFormDialog({ branchId }: { branchId: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createVideoAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          Add Video
        </Button>
      </DialogTrigger>
      <DialogContent title="Add Video">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          <FormField id="video-title" label="Title" required>
            <Input id="video-title" name="title" required />
          </FormField>
          <FormField id="video-url" label="Video URL" required hint="YouTube or other embeddable link">
            <Input id="video-url" name="videoUrl" type="url" required />
          </FormField>
          <FormField id="video-desc" label="Description">
            <Input id="video-desc" name="description" />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
