"use client";

import * as React from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { addCompetitiveExamMarkAction } from "@/server/actions/competitive-exam-actions";

type FormState = { error?: string; success?: boolean };

export function CompetitiveMarkForm({
  competitiveExamId,
  students,
}: {
  competitiveExamId: string;
  students: { id: string; admissionNumber: string; firstName: string; lastName: string }[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(addCompetitiveExamMarkAction, {});
  const [studentId, setStudentId] = React.useState(students[0]?.id ?? "");

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="competitiveExamId" value={competitiveExamId} />
      <input type="hidden" name="studentId" value={studentId} />
      <Select value={studentId} onValueChange={setStudentId}>
        <FormField id="mark-student" label="Student" required className="w-60">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </FormField>
        <SelectContent>
          {students.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.admissionNumber} — {s.firstName} {s.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormField id="mark-obtained" label="Marks" required className="w-24">
        <Input id="mark-obtained" name="marksObtained" type="number" min={0} required />
      </FormField>
      <FormField id="mark-max" label="Max marks" required className="w-24">
        <Input id="mark-max" name="maxMarks" type="number" min={1} required defaultValue={100} />
      </FormField>
      <FormField id="mark-remarks" label="Remarks">
        <Input id="mark-remarks" name="remarks" className="w-40" />
      </FormField>
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Saving…" : "Save Mark"}
      </Button>
      {state?.error && (
        <p role="alert" className="w-full text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
