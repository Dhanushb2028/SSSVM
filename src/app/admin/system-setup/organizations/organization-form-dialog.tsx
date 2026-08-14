"use client";

import * as React from "react";
import { useActionState } from "react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Plus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { createOrganizationAction, updateOrganizationAction } from "@/server/actions/organization-actions";

type FormState = { error?: string; success?: boolean };

export function OrganizationFormDialog({
  mode,
  organization,
}: {
  mode: "create" | "edit";
  organization?: { id: string; name: string };
}) {
  const [open, setOpen] = React.useState(false);
  const action = mode === "create" ? createOrganizationAction : updateOrganizationAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus aria-hidden="true" />
            Add Organization
          </Button>
        ) : (
          <Button variant="ghost" size="sm" aria-label={`Edit ${organization?.name}`}>
            <Pencil aria-hidden="true" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={mode === "create" ? "Add Organization" : "Edit Organization"}>
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "edit" && <input type="hidden" name="id" value={organization?.id} />}
          <FormField id="org-name" label="Organization name" required>
            <Input id="org-name" name="name" required defaultValue={organization?.name} />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
