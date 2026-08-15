"use client";

import { useActionState } from "react";
import { ArrowRight, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { advanceEnquiryStageAction, markEnquiryLostAction } from "@/server/actions/enquiry-actions";

type FormState = { error?: string; success?: boolean };

export function AdvanceStageButton({ id, label }: { id: string; label: string }) {
  const [, formAction, pending] = useActionState<FormState, FormData>(advanceEnquiryStageAction, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {label} <ArrowRight aria-hidden="true" className="size-3.5" />
      </Button>
    </form>
  );
}

export function MarkLostButton({ id }: { id: string }) {
  const [, formAction, pending] = useActionState<FormState, FormData>(markEnquiryLostAction, {});
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant="ghost" disabled={pending} aria-label="Mark as lost">
        <Ban aria-hidden="true" className="text-danger" />
      </Button>
    </form>
  );
}
