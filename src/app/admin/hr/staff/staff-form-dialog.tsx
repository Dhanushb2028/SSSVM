"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { createStaffAction, updateStaffAction } from "@/server/actions/staff-actions";

type FormState = { error?: string; success?: boolean };
type Branch = { id: string; name: string };
type Staff = {
  id: string;
  branchId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string | null;
  employmentType: string;
  qualification: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  joinDate: Date;
};

export function StaffFormDialog({ mode, branches, staff }: { mode: "create" | "edit"; branches: Branch[]; staff?: Staff }) {
  const [open, setOpen] = React.useState(false);
  const action = mode === "create" ? createStaffAction : updateStaffAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [branchId, setBranchId] = React.useState(staff?.branchId ?? branches[0]?.id ?? "");
  const [employmentType, setEmploymentType] = React.useState(staff?.employmentType ?? "PERMANENT");
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus aria-hidden="true" />
            Add Staff
          </Button>
        ) : (
          <Button variant="ghost" size="sm" aria-label={`Edit ${staff?.firstName}`}>
            <Pencil aria-hidden="true" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={mode === "create" ? "Add Staff" : "Edit Staff"}>
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "edit" && <input type="hidden" name="id" value={staff?.id} />}
          <input type="hidden" name="branchId" value={branchId} />
          <input type="hidden" name="employmentType" value={employmentType} />

          <Select value={branchId} onValueChange={setBranchId}>
            <FormField id="staff-branch" label="Branch" required>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <FormField id="staff-code" label="Employee code" required>
              <Input id="staff-code" name="employeeCode" required defaultValue={staff?.employeeCode} />
            </FormField>
            <FormField id="staff-join" label="Join date" required>
              <Input id="staff-join" name="joinDate" type="date" required defaultValue={staff ? staff.joinDate.toISOString().slice(0, 10) : ""} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="staff-first" label="First name" required>
              <Input id="staff-first" name="firstName" required defaultValue={staff?.firstName} />
            </FormField>
            <FormField id="staff-last" label="Last name" required>
              <Input id="staff-last" name="lastName" required defaultValue={staff?.lastName} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="staff-designation" label="Designation" required>
              <Input id="staff-designation" name="designation" required defaultValue={staff?.designation} />
            </FormField>
            <FormField id="staff-department" label="Department">
              <Input id="staff-department" name="department" defaultValue={staff?.department ?? ""} />
            </FormField>
          </div>
          <Select value={employmentType} onValueChange={setEmploymentType}>
            <FormField id="staff-employment" label="Employment type">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value="PERMANENT">Permanent</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="PART_TIME">Part time</SelectItem>
            </SelectContent>
          </Select>
          <FormField id="staff-qualification" label="Qualification">
            <Input id="staff-qualification" name="qualification" defaultValue={staff?.qualification ?? ""} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="staff-phone" label="Phone" required>
              <Input id="staff-phone" name="phone" required defaultValue={staff?.phone} />
            </FormField>
            <FormField id="staff-email" label="Email">
              <Input id="staff-email" name="email" type="email" defaultValue={staff?.email ?? ""} />
            </FormField>
          </div>
          <FormField id="staff-address" label="Address">
            <Input id="staff-address" name="address" defaultValue={staff?.address ?? ""} />
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
