"use client";

import * as React from "react";
import { useActionState } from "react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Plus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { createPermissionProfileAction, updatePermissionProfileAction } from "@/server/actions/permission-profile-actions";
import { PermissionGrid, type GrantKey } from "./permission-grid";

type FormState = { error?: string; success?: boolean };

export function RoleFormDialog({
  mode,
  profile,
}: {
  mode: "create" | "edit";
  profile?: { id: string; name: string; grants: { module: string; action: string }[] };
}) {
  const [open, setOpen] = React.useState(false);
  const action = mode === "create" ? createPermissionProfileAction : updatePermissionProfileAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  const initialGrants = React.useMemo(
    () => new Set((profile?.grants ?? []).map((g) => `${g.module}::${g.action}` as GrantKey)),
    [profile],
  );

  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus aria-hidden="true" />
            Add Role
          </Button>
        ) : (
          <Button variant="ghost" size="sm" aria-label={`Edit ${profile?.name}`}>
            <Pencil aria-hidden="true" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={mode === "create" ? "Add Role" : "Edit Role"} className="max-w-2xl">
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "edit" && <input type="hidden" name="id" value={profile?.id} />}
          <FormField id="role-name" label="Role name" required hint='e.g. "Front Office" or "Finance Staff"'>
            <Input id="role-name" name="name" required defaultValue={profile?.name} />
          </FormField>

          <PermissionGrid initialGrants={initialGrants} />

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
