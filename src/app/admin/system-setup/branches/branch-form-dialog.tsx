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
import { createBranchAction, updateBranchAction } from "@/server/actions/branch-actions";

type FormState = { error?: string; success?: boolean };

export function BranchFormDialog({
  mode,
  organizations,
  branch,
}: {
  mode: "create" | "edit";
  organizations: { id: string; name: string }[];
  branch?: {
    id: string;
    name: string;
    city: string | null;
    address: string | null;
    phone: string | null;
    organizationId: string;
  };
}) {
  const [open, setOpen] = React.useState(false);
  const action = mode === "create" ? createBranchAction : updateBranchAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [organizationId, setOrganizationId] = React.useState(branch?.organizationId ?? "");

  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus aria-hidden="true" />
            Add Branch
          </Button>
        ) : (
          <Button variant="ghost" size="sm" aria-label={`Edit ${branch?.name}`}>
            <Pencil aria-hidden="true" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={mode === "create" ? "Add Branch" : "Edit Branch"}>
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "edit" && <input type="hidden" name="id" value={branch?.id} />}
          <input type="hidden" name="organizationId" value={organizationId} />

          <Select value={organizationId} onValueChange={setOrganizationId}>
            <FormField id="branch-org" label="Organization" required>
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormField id="branch-name" label="Branch name" required>
            <Input id="branch-name" name="name" required defaultValue={branch?.name} />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="branch-city" label="City">
              <Input id="branch-city" name="city" defaultValue={branch?.city ?? ""} />
            </FormField>
            <FormField id="branch-phone" label="Phone">
              <Input id="branch-phone" name="phone" defaultValue={branch?.phone ?? ""} />
            </FormField>
          </div>
          <FormField id="branch-address" label="Address">
            <Input id="branch-address" name="address" defaultValue={branch?.address ?? ""} />
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
