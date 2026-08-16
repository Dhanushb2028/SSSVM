"use client";

import * as React from "react";
import { useActionState } from "react";
import { UserCheck } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { convertEnquiryAction } from "@/server/actions/enquiry-actions";

type FormState = { error?: string; success?: boolean };

export function ConvertEnquiryDialog({
  enquiryId,
  studentName,
  sections,
}: {
  enquiryId: string;
  studentName: string;
  sections: { id: string; name: string; course: { name: string } }[];
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(convertEnquiryAction, {});
  const [gender, setGender] = React.useState("MALE");
  const [sectionId, setSectionId] = React.useState(sections[0]?.id ?? "");
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="primary">
          <UserCheck aria-hidden="true" />
          Convert to Admission
        </Button>
      </DialogTrigger>
      <DialogContent title="Convert to Admission" description={`Create a student master record for ${studentName}.`}>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="enquiryId" value={enquiryId} />
          <input type="hidden" name="gender" value={gender} />
          <input type="hidden" name="sectionId" value={sectionId} />

          <FormField id="conv-admno" label="Admission number" required>
            <Input id="conv-admno" name="admissionNumber" required />
          </FormField>
          <FormField id="conv-dob" label="Date of birth" required>
            <Input id="conv-dob" name="dob" type="date" required />
          </FormField>
          <Select value={gender} onValueChange={setGender}>
            <FormField id="conv-gender" label="Gender" required>
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
          <Select value={sectionId} onValueChange={setSectionId}>
            <FormField id="conv-section" label="Section" required hint="A student must be placed into a section to be enrolled">
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
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

          {sections.length === 0 && (
            <p className="text-sm text-danger">No sections exist for this branch yet. Create a section before converting.</p>
          )}

          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending || !sectionId}>
              {pending ? "Converting…" : "Convert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
