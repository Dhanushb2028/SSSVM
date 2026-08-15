"use client";

import * as React from "react";
import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { generateStaffLoginAction } from "@/server/actions/staff-actions";

type FormState = { error?: string; success?: boolean };

export function GenerateLoginDialog({ staffId, suggestedUsername }: { staffId: string; suggestedUsername: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(generateStaffLoginAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Generate login">
          <KeyRound aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Generate Login"
        description="Creates a Teacher-role portal login for this staff member. Non-teaching staff can still have a record without a login."
      >
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="staffMemberId" value={staffId} />
          <FormField id="login-username" label="Username" required>
            <Input id="login-username" name="username" required defaultValue={suggestedUsername} />
          </FormField>
          <FormField id="login-password" label="Initial password" required hint="At least 8 characters.">
            <Input id="login-password" name="password" type="text" required minLength={8} />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create Login"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
