"use client";

import * as React from "react";
import { useActionState } from "react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { resetUserPasswordAction } from "@/server/actions/user-actions";

type FormState = { error?: string; success?: boolean };

export function ResetPasswordDialog({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(resetUserPasswordAction, {});

  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Reset password for ${userName}`}>
          <KeyRound aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Reset password"
        description={`Set a new password for ${userName}. They'll be signed out everywhere and must use the new password.`}
      >
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={userId} />
          <FormField id="reset-password" label="New password" required hint="At least 8 characters.">
            <Input id="reset-password" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={pending} variant="primary">
              {pending ? "Working…" : "Reset password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
