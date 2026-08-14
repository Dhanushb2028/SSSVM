"use client";

import { useActionState } from "react";
import { changePasswordAction, type ProfileFormState } from "@/server/actions/profile-actions";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: ProfileFormState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initial);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormField id="currentPassword" label="Current password" required>
        <Input name="currentPassword" type="password" autoComplete="current-password" required />
      </FormField>
      <FormField id="newPassword" label="New password" required hint="At least 8 characters.">
        <Input name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
      </FormField>
      <FormField id="confirmPassword" label="Confirm new password" required>
        <Input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
      </FormField>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-success">
          {state.success}
        </p>
      )}
      <Button type="submit" disabled={pending} variant="secondary" className="w-fit">
        {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}
