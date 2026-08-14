"use client";

import * as React from "react";
import { useActionState } from "react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ActionState = { error?: string; success?: boolean };

/**
 * Shared confirm-then-act pattern for destructive/irreversible actions
 * (Section 9): every such action gets an explicit confirmation step before
 * the underlying server action runs.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  action,
  hiddenFields,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  /** Extra values (e.g. the target record's id) submitted alongside the form. */
  hiddenFields?: Record<string, string>;
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState(action, {});

  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={title} description={description}>
        <form action={formAction} className="flex flex-col gap-4">
          {hiddenFields &&
            Object.entries(hiddenFields).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant={variant} disabled={pending}>
              {pending ? "Working…" : confirmLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
