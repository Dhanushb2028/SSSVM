"use client";

import * as React from "react";
import { useActionState } from "react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Plus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { createAdminUserAction, updateAdminUserAction } from "@/server/actions/user-actions";

type FormState = { error?: string; success?: boolean };
const NONE = "__none__";

export function UserFormDialog({
  mode,
  branches,
  profiles,
  user,
}: {
  mode: "create" | "edit";
  branches: { id: string; name: string }[];
  profiles: { id: string; name: string }[];
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    branchId: string | null;
    permissionProfileId: string | null;
  };
}) {
  const [open, setOpen] = React.useState(false);
  const action = mode === "create" ? createAdminUserAction : updateAdminUserAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [branchId, setBranchId] = React.useState(user?.branchId ?? NONE);
  const [profileId, setProfileId] = React.useState(user?.permissionProfileId ?? NONE);

  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus aria-hidden="true" />
            Add Admin User
          </Button>
        ) : (
          <Button variant="ghost" size="sm" aria-label={`Edit ${user?.name}`}>
            <Pencil aria-hidden="true" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        title={mode === "create" ? "Add Admin User" : "Edit Admin User"}
        description={mode === "create" ? "Staff/office accounts with admin-portal access." : undefined}
      >
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "edit" && <input type="hidden" name="id" value={user?.id} />}
          <input type="hidden" name="branchId" value={branchId === NONE ? "" : branchId} />
          <input type="hidden" name="permissionProfileId" value={profileId === NONE ? "" : profileId} />

          {mode === "create" && (
            <FormField id="user-username" label="Username" required>
              <Input id="user-username" name="username" required autoComplete="off" />
            </FormField>
          )}
          <FormField id="user-name" label="Full name" required>
            <Input id="user-name" name="name" required defaultValue={user?.name ?? ""} />
          </FormField>
          <FormField id="user-email" label="Email">
            <Input id="user-email" name="email" type="email" defaultValue={user?.email ?? ""} />
          </FormField>
          {mode === "create" && (
            <FormField id="user-password" label="Temporary password" required hint="At least 8 characters.">
              <Input id="user-password" name="password" type="password" required minLength={8} autoComplete="new-password" />
            </FormField>
          )}

          <Select value={branchId} onValueChange={setBranchId}>
            <FormField id="user-branch" label="Branch scope" hint="Leave as 'All branches' for org-wide access.">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value={NONE}>All branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={profileId} onValueChange={setProfileId}>
            <FormField id="user-profile" label="Role / permission profile" hint="Leave as 'Full access' for an unrestricted admin.">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value={NONE}>Full access</SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
