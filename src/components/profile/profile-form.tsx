"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileFormState } from "@/server/actions/profile-actions";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: ProfileFormState = {};

export function ProfileForm({
  initialValues,
}: {
  initialValues: { firstName: string; lastName: string; email: string; phone: string; phoneEditable: boolean };
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initial);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="firstName" label="First name" required>
          <Input name="firstName" defaultValue={initialValues.firstName} required />
        </FormField>
        <FormField id="lastName" label="Last name">
          <Input name="lastName" defaultValue={initialValues.lastName} />
        </FormField>
      </div>
      <FormField id="email" label="Email">
        <Input name="email" type="email" defaultValue={initialValues.email} />
      </FormField>
      <FormField
        id="phone"
        label="Mobile number"
        hint={!initialValues.phoneEditable ? "Contact the school office to change your mobile number." : undefined}
      >
        <Input name="phone" type="tel" defaultValue={initialValues.phone} disabled={!initialValues.phoneEditable} />
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
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
