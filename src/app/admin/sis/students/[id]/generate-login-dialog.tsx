"use client";

import * as React from "react";
import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { generateStudentLoginAction } from "@/server/actions/student-actions";

type FormState = { error?: string; success?: boolean };

export function GenerateStudentLoginDialog({ studentId, suggestedUsername }: { studentId: string; suggestedUsername: string }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(generateStudentLoginAction, {});
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <KeyRound aria-hidden="true" />
          Generate Login
        </Button>
      </DialogTrigger>
      <DialogContent title="Generate Login" description="Creates a Student portal login for this student.">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="studentId" value={studentId} />
          <FormField id="student-login-username" label="Username" required hint="Students sign in with this instead of a mobile number.">
            <Input id="student-login-username" name="username" required defaultValue={suggestedUsername} />
          </FormField>
          <FormField id="student-login-password" label="Initial password" required hint="At least 8 characters.">
            <Input id="student-login-password" name="password" type="text" required minLength={8} />
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
