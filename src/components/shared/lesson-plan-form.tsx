"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { saveLessonPlanAction } from "@/server/actions/lesson-plan-actions";

type FormState = { error?: string; success?: boolean };

export function LessonPlanForm({
  sectionId,
  subjectId,
  month,
  year,
  initialText,
}: {
  sectionId: string;
  subjectId: string;
  month: number;
  year: number;
  initialText: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveLessonPlanAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="sectionId" value={sectionId} />
      <input type="hidden" name="subjectId" value={subjectId} />
      <input type="hidden" name="month" value={month} />
      <input type="hidden" name="year" value={year} />
      <FormField id="plan-text" label="Lesson plan" required hint="What will be covered this month.">
        <textarea
          id="plan-text"
          name="planText"
          rows={8}
          required
          defaultValue={initialText}
          className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </FormField>
      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving…" : "Save Plan"}
        </Button>
        {state?.success && <span className="text-sm text-success">Saved</span>}
      </div>
    </form>
  );
}
