"use client";

import * as React from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { saveExamMarksAction } from "@/server/actions/exam-marks-actions";

type RosterStudent = { id: string; admissionNumber: string; firstName: string; lastName: string; marksObtained: number | null };
type FormState = { error?: string; success?: boolean };

export function ExamMarksBoard({
  examSubjectId,
  sectionId,
  maxMarks,
  roster,
}: {
  examSubjectId: string;
  sectionId: string;
  maxMarks: number;
  roster: RosterStudent[];
}) {
  const [marks, setMarks] = React.useState<Record<string, string>>(
    Object.fromEntries(roster.map((s) => [s.id, s.marksObtained !== null ? String(s.marksObtained) : ""])),
  );
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveExamMarksAction, {});

  const [prevRoster, setPrevRoster] = React.useState(roster);
  if (roster !== prevRoster) {
    setPrevRoster(roster);
    setMarks(Object.fromEntries(roster.map((s) => [s.id, s.marksObtained !== null ? String(s.marksObtained) : ""])));
  }

  const recordsJson = JSON.stringify(
    roster.filter((s) => marks[s.id] !== "" && marks[s.id] !== undefined).map((s) => ({ studentId: s.id, marksObtained: Number(marks[s.id]) })),
  );

  if (roster.length === 0) {
    return <p className="text-sm text-muted-foreground">Select an exam, subject, and section above.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="examSubjectId" value={examSubjectId} />
      <input type="hidden" name="sectionId" value={sectionId} />
      <input type="hidden" name="records" value={recordsJson} />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Admission No.</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Marks (out of {maxMarks})</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">{s.admissionNumber}</td>
                <td className="px-3 py-2">{s.firstName} {s.lastName}</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min={0}
                    max={maxMarks}
                    className="w-24"
                    aria-label={`Marks for ${s.firstName} ${s.lastName}`}
                    value={marks[s.id] ?? ""}
                    onChange={(e) => setMarks((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox name="notify" />
        Send SMS notification to parents on save
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving…" : "Save Marks"}
        </Button>
        {state?.success && <StatusBadge tone="success">Saved</StatusBadge>}
      </div>
    </form>
  );
}
