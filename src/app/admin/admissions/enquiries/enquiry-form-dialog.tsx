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
import { createEnquiryAction } from "@/server/actions/enquiry-actions";

type FormState = { error?: string; success?: boolean };
const NONE = "__none__";

export function EnquiryFormDialog({
  branchId,
  courses,
  meos,
}: {
  branchId: string;
  courses: { id: string; name: string }[];
  meos: { id: string; firstName: string; lastName: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createEnquiryAction, {});
  const [courseId, setCourseId] = React.useState(NONE);
  const [meoId, setMeoId] = React.useState(NONE);
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          New Enquiry
        </Button>
      </DialogTrigger>
      <DialogContent title="New Admission Enquiry">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          <input type="hidden" name="courseId" value={courseId === NONE ? "" : courseId} />
          <input type="hidden" name="assignedMeoId" value={meoId === NONE ? "" : meoId} />

          <FormField id="enq-student" label="Student name" required>
            <Input id="enq-student" name="studentName" required />
          </FormField>
          <FormField id="enq-parent" label="Parent name" required>
            <Input id="enq-parent" name="parentName" required />
          </FormField>
          <FormField id="enq-phone" label="Phone" required>
            <Input id="enq-phone" name="phone" required />
          </FormField>
          <FormField id="enq-email" label="Email">
            <Input id="enq-email" name="email" type="email" />
          </FormField>

          <Select value={courseId} onValueChange={setCourseId}>
            <FormField id="enq-course" label="Interested Course">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value={NONE}>Not specified</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={meoId} onValueChange={setMeoId}>
            <FormField id="enq-meo" label="Assigned MEO">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              <SelectItem value={NONE}>Unassigned</SelectItem>
              {meos.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormField id="enq-source" label="Source" hint="e.g. Walk-in, Referral, Ad">
            <Input id="enq-source" name="source" />
          </FormField>
          <FormField id="enq-fee" label="Fee commitment">
            <Input id="enq-fee" name="feeCommitment" type="number" />
          </FormField>
          <FormField id="enq-notes" label="Notes">
            <Input id="enq-notes" name="notes" />
          </FormField>

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
