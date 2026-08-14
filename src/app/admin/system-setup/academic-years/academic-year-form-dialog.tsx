"use client";

import * as React from "react";
import { useActionState } from "react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Plus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { createAcademicYearAction, updateAcademicYearAction } from "@/server/actions/academic-year-actions";

type FormState = { error?: string; success?: boolean };

function toInputDate(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

export function AcademicYearFormDialog({
  mode,
  branches,
  year,
}: {
  mode: "create" | "edit";
  branches: { id: string; name: string }[];
  year?: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
    branchId: string;
  };
}) {
  const [open, setOpen] = React.useState(false);
  const action = mode === "create" ? createAcademicYearAction : updateAcademicYearAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [branchId, setBranchId] = React.useState(year?.branchId ?? branches[0]?.id ?? "");

  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus aria-hidden="true" />
            Add Academic Year
          </Button>
        ) : (
          <Button variant="ghost" size="sm" aria-label={`Edit ${year?.name}`}>
            <Pencil aria-hidden="true" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={mode === "create" ? "Add Academic Year" : "Edit Academic Year"}>
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "edit" && <input type="hidden" name="id" value={year?.id} />}
          <input type="hidden" name="branchId" value={branchId} />

          <Select value={branchId} onValueChange={setBranchId}>
            <FormField id="year-branch" label="Branch" required>
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

          <FormField id="year-name" label="Name" required hint="e.g. 2025-2026">
            <Input id="year-name" name="name" required defaultValue={year?.name} />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="year-start" label="Start date" required>
              <Input
                id="year-start"
                name="startDate"
                type="date"
                required
                defaultValue={year ? toInputDate(year.startDate) : undefined}
              />
            </FormField>
            <FormField id="year-end" label="End date" required>
              <Input
                id="year-end"
                name="endDate"
                type="date"
                required
                defaultValue={year ? toInputDate(year.endDate) : undefined}
              />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox name="isCurrent" defaultChecked={year?.isCurrent} />
            Mark as the current academic year for this branch
          </label>

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
