"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";

type FormState = { error?: string; success?: boolean };

type StudentOption = { id: string; admissionNumber: string; firstName: string; lastName: string };
type SectionOption = { id: string; name: string; course: { name: string }; branch: { name: string } };

export function BulkMoverForm({
  students,
  targetSections,
  action,
  confirmVerb,
}: {
  students: StudentOption[];
  targetSections: SectionOption[];
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  confirmVerb: string;
}) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set(students.map((s) => s.id)));
  const [targetSectionId, setTargetSectionId] = React.useState("");

  // Re-select all students when a new source section's roster arrives (derived during
  // render, not an effect — see lib/hooks/use-close-on-success.ts for the same pattern).
  const [prevStudents, setPrevStudents] = React.useState(students);
  if (students !== prevStudents) {
    setPrevStudents(students);
    setSelected(new Set(students.map((s) => s.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const targetLabel = targetSections.find((s) => s.id === targetSectionId);

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground">Select a source section with active students above.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th scope="col" className="w-10 px-3 py-2">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                Admission No.
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                Name
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  <Checkbox
                    checked={selected.has(s.id)}
                    onCheckedChange={() => toggle(s.id)}
                    aria-label={`Select ${s.firstName} ${s.lastName}`}
                  />
                </td>
                <td className="px-3 py-2">{s.admissionNumber}</td>
                <td className="px-3 py-2">
                  {s.firstName} {s.lastName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Select value={targetSectionId} onValueChange={setTargetSectionId}>
        <FormField id="target-section" label="Target section" required>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Select target section" />
          </SelectTrigger>
        </FormField>
        <SelectContent>
          {targetSections.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.branch.name} · {s.course.name} - {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ConfirmDialog
        trigger={
          <Button disabled={selected.size === 0 || !targetSectionId} className="w-fit">
            {confirmVerb} {selected.size} student(s)
          </Button>
        }
        title={`${confirmVerb} students`}
        description={
          targetLabel
            ? `${confirmVerb} ${selected.size} student(s) to ${targetLabel.course.name} - ${targetLabel.name} (${targetLabel.branch.name})? This can be undone with another section change.`
            : `${confirmVerb} ${selected.size} student(s)?`
        }
        confirmLabel={confirmVerb}
        variant="primary"
        action={action}
        hiddenFields={{ targetSectionId, studentIds: JSON.stringify(Array.from(selected)) }}
      />
    </div>
  );
}
