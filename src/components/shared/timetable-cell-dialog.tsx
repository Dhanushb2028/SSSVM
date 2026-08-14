"use client";

import * as React from "react";
import { useActionState } from "react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { setTimetableEntryAction } from "@/server/actions/timetable-actions";

type FormState = { error?: string; success?: boolean };
const NONE = "__none__";

export function TimetableCellDialog({
  sectionId,
  weekday,
  period,
  subjects,
  teachers,
  current,
}: {
  sectionId: string;
  weekday: string;
  period: number;
  subjects: { id: string; name: string }[];
  teachers: { id: string; firstName: string; lastName: string }[];
  current?: { subjectId: string; subjectName: string; teacherId: string | null; teacherName: string | null };
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(setTimetableEntryAction, {});
  const [subjectId, setSubjectId] = React.useState(current?.subjectId ?? NONE);
  const [teacherId, setTeacherId] = React.useState(current?.teacherId ?? NONE);
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-16 w-full flex-col items-start justify-center gap-0.5 rounded-md border border-border p-2 text-left text-xs hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {current ? (
            <>
              <span className="font-medium text-foreground">{current.subjectName}</span>
              <span className="text-muted-foreground">{current.teacherName ?? "No teacher"}</span>
            </>
          ) : (
            <span className="text-muted-foreground">+ Add</span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent title={`${weekday} · Period ${period}`}>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="sectionId" value={sectionId} />
          <input type="hidden" name="weekday" value={weekday} />
          <input type="hidden" name="period" value={period} />
          <input type="hidden" name="subjectId" value={subjectId === NONE ? "" : subjectId} />
          <input type="hidden" name="teacherId" value={teacherId === NONE ? "" : teacherId} />

          <Select value={subjectId} onValueChange={setSubjectId}>
            <FormField id="tt-subject" label="Subject">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value={NONE}>Empty (clear this period)</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={teacherId} onValueChange={setTeacherId}>
            <FormField id="tt-teacher" label="Teacher">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value={NONE}>Unassigned</SelectItem>
              {teachers.map((t) => (
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
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
