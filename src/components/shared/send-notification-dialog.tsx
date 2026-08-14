"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { sendNotificationAction } from "@/server/actions/notification-actions";

type FormState = { error?: string; success?: boolean };
type SectionOption = { id: string; name: string; course: { name: string } };
type StudentOption = { id: string; sectionId: string; firstName: string; lastName: string; admissionNumber: string };

export function SendNotificationDialog({
  branchId,
  sections,
  students,
  allowAll,
}: {
  branchId: string;
  sections: SectionOption[];
  students: StudentOption[];
  allowAll: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(sendNotificationAction, {});
  const [targetType, setTargetType] = React.useState<"ALL" | "SECTION" | "STUDENT">(allowAll ? "ALL" : "SECTION");
  const [sectionId, setSectionId] = React.useState(sections[0]?.id ?? "");
  const [studentId, setStudentId] = React.useState("");
  useCloseOnSuccess(state, () => setOpen(false));

  const studentsInSection = students.filter((s) => s.sectionId === sectionId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          Send Notification
        </Button>
      </DialogTrigger>
      <DialogContent title="Send Notification">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="sectionId" value={targetType === "ALL" ? "" : sectionId} />
          <input type="hidden" name="studentId" value={targetType === "STUDENT" ? studentId : ""} />

          <Select value={targetType} onValueChange={(v) => setTargetType(v as typeof targetType)}>
            <FormField id="notif-target" label="Send to" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {allowAll && <SelectItem value="ALL">Everyone in this branch</SelectItem>}
              <SelectItem value="SECTION">A section</SelectItem>
              <SelectItem value="STUDENT">One student</SelectItem>
            </SelectContent>
          </Select>

          {targetType !== "ALL" && (
            <Select value={sectionId} onValueChange={setSectionId}>
              <FormField id="notif-section" label="Section" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormField>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.course.name} - {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {targetType === "STUDENT" && (
            <Select value={studentId} onValueChange={setStudentId}>
              <FormField id="notif-student" label="Student" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
              </FormField>
              <SelectContent>
                {studentsInSection.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.admissionNumber} — {s.firstName} {s.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <FormField id="notif-title" label="Title" required>
            <Input id="notif-title" name="title" required />
          </FormField>
          <FormField id="notif-body" label="Message" required>
            <textarea
              id="notif-body"
              name="body"
              rows={3}
              required
              className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>

          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
