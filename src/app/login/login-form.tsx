"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-4 rounded-xl border-t-4 border-x border-b border-x-border border-b-border border-t-gold-strong bg-surface p-6 shadow-lg shadow-slate-900/5"
    >
      <FormField id="identifier" label="Username or mobile number" required>
        <Input name="identifier" type="text" autoComplete="username" required />
      </FormField>
      <FormField id="password" label="Password" required>
        <Input name="password" type="password" autoComplete="current-password" required />
      </FormField>
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Staff and students sign in with their username. Parents sign in with their registered mobile number.
      </p>
    </form>
  );
}
