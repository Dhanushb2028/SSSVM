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
import { createSectionAction, updateSectionAction } from "@/server/actions/section-actions";

type FormState = { error?: string; success?: boolean };
const NONE = "__none__";

type PickerData = {
  branches: { id: string; name: string }[];
  courses: { id: string; name: string }[];
  academicYears: { id: string; name: string; branchId: string }[];
  teachers: { id: string; firstName: string; lastName: string; branchId: string }[];
};

export function SectionFormDialog({
  mode,
  picker,
  section,
}: {
  mode: "create" | "edit";
  picker: PickerData;
  section?: {
    id: string;
    name: string;
    capacity: number | null;
    branchId: string;
    courseId: string;
    academicYearId: string;
    classTeacherId: string | null;
  };
}) {
  const [open, setOpen] = React.useState(false);
  const action = mode === "create" ? createSectionAction : updateSectionAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  const [branchId, setBranchId] = React.useState(section?.branchId ?? picker.branches[0]?.id ?? "");
  const [courseId, setCourseId] = React.useState(section?.courseId ?? picker.courses[0]?.id ?? "");
  const [academicYearId, setAcademicYearId] = React.useState(section?.academicYearId ?? "");
  const [classTeacherId, setClassTeacherId] = React.useState(section?.classTeacherId ?? NONE);

  useCloseOnSuccess(state, () => setOpen(false));

  const yearsForBranch = picker.academicYears.filter((y) => y.branchId === branchId);
  const teachersForBranch = picker.teachers.filter((t) => t.branchId === branchId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <Plus aria-hidden="true" />
            Add Section
          </Button>
        ) : (
          <Button variant="ghost" size="sm" aria-label={`Edit ${section?.name}`}>
            <Pencil aria-hidden="true" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={mode === "create" ? "Add Section" : "Edit Section"}>
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "edit" && <input type="hidden" name="id" value={section?.id} />}
          <input type="hidden" name="branchId" value={branchId} />
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="academicYearId" value={academicYearId} />
          <input type="hidden" name="classTeacherId" value={classTeacherId === NONE ? "" : classTeacherId} />

          <Select value={branchId} onValueChange={setBranchId}>
            <FormField id="section-branch" label="Branch" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {picker.branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={academicYearId} onValueChange={setAcademicYearId}>
            <FormField id="section-year" label="Academic year" required>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {yearsForBranch.map((y) => (
                <SelectItem key={y.id} value={y.id}>
                  {y.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={courseId} onValueChange={setCourseId}>
            <FormField id="section-course" label="Course / Grade" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {picker.courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="section-name" label="Section name" required hint="e.g. A">
              <Input id="section-name" name="name" required defaultValue={section?.name} />
            </FormField>
            <FormField id="section-capacity" label="Capacity">
              <Input id="section-capacity" name="capacity" type="number" min={1} defaultValue={section?.capacity ?? ""} />
            </FormField>
          </div>

          <Select value={classTeacherId} onValueChange={setClassTeacherId}>
            <FormField id="section-teacher" label="Class teacher">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value={NONE}>Unassigned</SelectItem>
              {teachersForBranch.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
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
