"use client";

import * as React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { sendBulkSmsAction } from "@/server/actions/bulk-sms-actions";

type FormState = { error?: string; success?: boolean; sentCount?: number };

export function BulkSmsForm({ branchId, courses }: { branchId: string; courses: { id: string; name: string }[] }) {
  const [targetType, setTargetType] = React.useState<"ALL" | "COURSE">("ALL");
  const [courseId, setCourseId] = React.useState(courses[0]?.id ?? "");
  const [message, setMessage] = React.useState("");
  const [lastResult, setLastResult] = React.useState<FormState | null>(null);

  const action = async (_prev: FormState, formData: FormData): Promise<FormState> => {
    const result = await sendBulkSmsAction(_prev, formData);
    setLastResult(result);
    return result;
  };

  return (
    <div className="flex flex-col gap-4">
      <Select value={targetType} onValueChange={(v) => setTargetType(v as typeof targetType)}>
        <FormField id="sms-target" label="Send to" required>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
        </FormField>
        <SelectContent>
          <SelectItem value="ALL">All guardians (this branch)</SelectItem>
          <SelectItem value="COURSE">Guardians of one course</SelectItem>
        </SelectContent>
      </Select>

      {targetType === "COURSE" && (
        <Select value={courseId} onValueChange={setCourseId}>
          <FormField id="sms-course" label="Course" required>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
          </FormField>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <FormField id="sms-message" label="Message" required hint="Sent via the stub notification provider — logs to the server console in dev.">
        <textarea
          id="sms-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={480}
          required
          className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </FormField>

      <ConfirmDialog
        trigger={
          <Button disabled={!message.trim()} className="w-fit">
            Review &amp; Send
          </Button>
        }
        title="Send bulk SMS"
        description={
          targetType === "ALL"
            ? "Send this message to every guardian with a student in this branch?"
            : `Send this message to every guardian with a student in the selected course?`
        }
        confirmLabel="Send"
        variant="primary"
        action={action}
        hiddenFields={{ branchId, targetType, courseId: targetType === "COURSE" ? courseId : "", message }}
      />

      {lastResult?.success && (
        <p role="status" className="text-sm text-success">
          Sent to {lastResult.sentCount} recipient(s).
        </p>
      )}
    </div>
  );
}
