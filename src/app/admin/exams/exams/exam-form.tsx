"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createExamAction, updateExamAction } from "@/server/actions/exam-actions";

type FormState = { error?: string; success?: boolean };

type SubjectRow = { subjectId: string; maxMarks: string; passMarks: string; examDate: string };

type PickerData = {
  branches: { id: string; name: string }[];
  academicYears: { id: string; name: string; branchId: string }[];
  examTypes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  courses: { id: string; name: string }[];
};

export function ExamForm({
  mode,
  picker,
  exam,
}: {
  mode: "create" | "edit";
  picker: PickerData;
  exam?: {
    id: string;
    name: string;
    branchId: string;
    academicYearId: string;
    examTypeId: string;
    courseId: string;
    startDate: Date;
    endDate: Date;
    includeInRank: boolean;
    subjects: { subjectId: string; maxMarks: number; passMarks: number | null; examDate: Date | null }[];
  };
}) {
  const action = mode === "create" ? createExamAction : updateExamAction;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  const [branchId, setBranchId] = React.useState(exam?.branchId ?? picker.branches[0]?.id ?? "");
  const [academicYearId, setAcademicYearId] = React.useState(exam?.academicYearId ?? "");
  const [examTypeId, setExamTypeId] = React.useState(exam?.examTypeId ?? picker.examTypes[0]?.id ?? "");
  const [courseId, setCourseId] = React.useState(exam?.courseId ?? picker.courses[0]?.id ?? "");
  const [rows, setRows] = React.useState<SubjectRow[]>(
    exam
      ? exam.subjects.map((s) => ({
          subjectId: s.subjectId,
          maxMarks: String(s.maxMarks),
          passMarks: s.passMarks ? String(s.passMarks) : "",
          examDate: s.examDate ? new Date(s.examDate).toISOString().slice(0, 10) : "",
        }))
      : [{ subjectId: picker.subjects[0]?.id ?? "", maxMarks: "100", passMarks: "35", examDate: "" }],
  );

  const toInputDate = (d: Date) => new Date(d).toISOString().slice(0, 10);
  const yearsForBranch = picker.academicYears.filter((y) => y.branchId === branchId);
  const subjectsJson = JSON.stringify(
    rows
      .filter((r) => r.subjectId && r.maxMarks)
      .map((r) => ({ subjectId: r.subjectId, maxMarks: r.maxMarks, passMarks: r.passMarks || undefined, examDate: r.examDate || undefined })),
  );

  function updateRow(index: number, patch: Partial<SubjectRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {mode === "edit" && <input type="hidden" name="id" value={exam?.id} />}
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="academicYearId" value={academicYearId} />
      <input type="hidden" name="examTypeId" value={examTypeId} />
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="subjects" value={subjectsJson} />

      <Card>
        <CardHeader>
          <CardTitle>Exam details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="exam-name" label="Exam name" required>
            <Input id="exam-name" name="name" required defaultValue={exam?.name} />
          </FormField>

          <Select value={courseId} onValueChange={setCourseId}>
            <FormField id="exam-course" label="Grade" required hint="Only sections in this grade can have marks entered against this exam">
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
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

          <Select value={examTypeId} onValueChange={setExamTypeId}>
            <FormField id="exam-type" label="Exam type" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {picker.examTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={branchId} onValueChange={setBranchId}>
            <FormField id="exam-branch" label="Branch" required>
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
            <FormField id="exam-year" label="Academic year" required>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
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

          <FormField id="exam-start" label="Start date" required>
            <Input id="exam-start" name="startDate" type="date" required defaultValue={exam ? toInputDate(exam.startDate) : undefined} />
          </FormField>
          <FormField id="exam-end" label="End date" required>
            <Input id="exam-end" name="endDate" type="date" required defaultValue={exam ? toInputDate(exam.endDate) : undefined} />
          </FormField>

          <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
            <Checkbox name="includeInRank" defaultChecked={exam?.includeInRank ?? true} />
            Include this exam in rank calculation
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Subjects &amp; exam timetable</CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setRows((prev) => [...prev, { subjectId: picker.subjects[0]?.id ?? "", maxMarks: "100", passMarks: "35", examDate: "" }])}
          >
            <Plus aria-hidden="true" />
            Add Subject
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-5 sm:items-end">
              <Select value={row.subjectId} onValueChange={(v) => updateRow(i, { subjectId: v })}>
                <FormField id={`subj-${i}`} label="Subject">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormField>
                <SelectContent>
                  {picker.subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormField id={`max-${i}`} label="Max marks">
                <Input
                  id={`max-${i}`}
                  type="number"
                  value={row.maxMarks}
                  onChange={(e) => updateRow(i, { maxMarks: e.target.value })}
                />
              </FormField>
              <FormField id={`pass-${i}`} label="Pass marks">
                <Input
                  id={`pass-${i}`}
                  type="number"
                  value={row.passMarks}
                  onChange={(e) => updateRow(i, { passMarks: e.target.value })}
                />
              </FormField>
              <FormField id={`date-${i}`} label="Exam date">
                <Input
                  id={`date-${i}`}
                  type="date"
                  value={row.examDate}
                  onChange={(e) => updateRow(i, { examDate: e.target.value })}
                />
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Remove subject"
                onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={rows.length === 1}
              >
                <Trash2 aria-hidden="true" className="text-danger" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : mode === "create" ? "Create Exam" : "Save changes"}
      </Button>
    </form>
  );
}
