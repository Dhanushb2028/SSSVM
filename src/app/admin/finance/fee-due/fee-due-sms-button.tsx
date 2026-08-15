"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { sendFeeDueSmsAction } from "@/server/actions/fee-due-sms-actions";

export function FeeDueSmsButton({ branchId, academicYearId, count }: { branchId: string; academicYearId: string; count: number }) {
  return (
    <ConfirmDialog
      trigger={
        <Button size="sm" disabled={count === 0}>
          <Send aria-hidden="true" />
          Send Fee Due SMS ({count})
        </Button>
      }
      title="Send fee due reminders"
      description={`Send a reminder SMS to the guardians of all ${count} student(s) with an outstanding balance?`}
      confirmLabel="Send"
      variant="primary"
      action={sendFeeDueSmsAction}
      hiddenFields={{ branchId, academicYearId }}
    />
  );
}
