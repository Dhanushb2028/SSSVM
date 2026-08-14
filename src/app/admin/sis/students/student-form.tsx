"use client";

import * as React from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createStudentAction, updateStudentAction } from "@/server/actions/student-actions";

type FormState = { error?: string; success?: boolean };
const NONE = "__none__";

type Branch = { id: string; name: string };
type Section = { id: string; name: string; branchId: string; course: { name: string } };

export function StudentForm({
  mode,
  branches,
  sections,
  student,
}: {
  mode: "create" | "edit";
  branches: Branch[];
  sections: Section[];
  student?: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    dob: Date;
    gender: string;
    bloodGroup: string | null;
    address: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    admissionDate: Date;
    branchId: string;
    sectionId: string | null;
  };
}) {
  const action = mode === "create" ? createStudentAction : updateStudentAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [branchId, setBranchId] = React.useState(student?.branchId ?? branches[0]?.id ?? "");
  const [sectionId, setSectionId] = React.useState(student?.sectionId ?? NONE);
  const [gender, setGender] = React.useState(student?.gender ?? "MALE");

  const sectionsForBranch = sections.filter((s) => s.branchId === branchId);
  const toInputDate = (d: Date) => new Date(d).toISOString().slice(0, 10);

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-6">
      {mode === "edit" && <input type="hidden" name="id" value={student?.id} />}
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="sectionId" value={sectionId === NONE ? "" : sectionId} />
      <input type="hidden" name="gender" value={gender} />

      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="admissionNumber" label="Admission number" required>
            <Input id="admissionNumber" name="admissionNumber" required defaultValue={student?.admissionNumber} />
          </FormField>
          <FormField id="photo" label="Photo">
            <Input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
          </FormField>
          <FormField id="firstName" label="First name" required>
            <Input id="firstName" name="firstName" required defaultValue={student?.firstName} />
          </FormField>
          <FormField id="lastName" label="Last name" required>
            <Input id="lastName" name="lastName" required defaultValue={student?.lastName} />
          </FormField>
          <FormField id="dob" label="Date of birth" required>
            <Input id="dob" name="dob" type="date" required defaultValue={student ? toInputDate(student.dob) : undefined} />
          </FormField>
          <Select value={gender} onValueChange={setGender}>
            <FormField id="gender" label="Gender" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          <FormField id="bloodGroup" label="Blood group">
            <Input id="bloodGroup" name="bloodGroup" defaultValue={student?.bloodGroup ?? ""} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Placement</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select value={branchId} onValueChange={setBranchId}>
            <FormField id="branch" label="Branch" required>
              <SelectTrigger>
                <SelectValue />
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
          <Select value={sectionId} onValueChange={setSectionId}>
            <FormField id="section" label="Section">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value={NONE}>Unassigned</SelectItem>
              {sectionsForBranch.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.course.name} - {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormField id="admissionDate" label="Admission date" required>
            <Input
              id="admissionDate"
              name="admissionDate"
              type="date"
              required
              defaultValue={student ? toInputDate(student.admissionDate) : new Date().toISOString().slice(0, 10)}
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="contactPhone" label="Contact phone">
            <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={student?.contactPhone ?? ""} />
          </FormField>
          <FormField id="contactEmail" label="Contact email">
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={student?.contactEmail ?? ""} />
          </FormField>
          <FormField id="address" label="Address" className="sm:col-span-2">
            <Input id="address" name="address" defaultValue={student?.address ?? ""} />
          </FormField>
        </CardContent>
      </Card>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Add Student" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
