"use client";

import { useActionState } from "react";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendBirthdayWishAction } from "@/server/actions/birthday-actions";

type FormState = { error?: string; success?: boolean };

export function SendWishButton({ studentId, firstName, phone }: { studentId: string; firstName: string; phone: string | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(sendBirthdayWishAction, {});

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="firstName" value={firstName} />
      <input type="hidden" name="phone" value={phone ?? ""} />
      <Button type="submit" variant="secondary" size="sm" disabled={pending || !phone || state.success}>
        <PartyPopper aria-hidden="true" />
        {state.success ? "Sent" : pending ? "Sending…" : "Send Wishes"}
      </Button>
      {state.error && (
        <span role="alert" className="text-xs text-danger">
          {state.error}
        </span>
      )}
    </form>
  );
}
