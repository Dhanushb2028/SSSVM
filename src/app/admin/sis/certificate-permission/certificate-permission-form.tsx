"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { setCertificatePermissionAction } from "@/server/actions/certificate-permission-actions";

type StudentRow = {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  tcEligible: boolean;
  section: { name: string; course: { name: string } } | null;
};

export function CertificatePermissionForm({ students }: { students: StudentRow[] }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const studentIdsJson = JSON.stringify(Array.from(selected));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <ConfirmDialog
          trigger={
            <Button disabled={selected.size === 0} variant="primary" size="sm">
              Enable TC eligibility ({selected.size})
            </Button>
          }
          title="Enable TC eligibility"
          description={`Allow ${selected.size} student(s) to be eligible for Transfer Certificate issuance?`}
          confirmLabel="Enable"
          variant="primary"
          action={setCertificatePermissionAction}
          hiddenFields={{ eligible: "true", studentIds: studentIdsJson }}
        />
        <ConfirmDialog
          trigger={
            <Button disabled={selected.size === 0} variant="secondary" size="sm">
              Disable TC eligibility ({selected.size})
            </Button>
          }
          title="Disable TC eligibility"
          description={`Remove TC eligibility from ${selected.size} student(s)?`}
          confirmLabel="Disable"
          action={setCertificatePermissionAction}
          hiddenFields={{ eligible: "false", studentIds: studentIdsJson }}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th scope="col" className="w-10 px-3 py-2">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Admission No.</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Section</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">TC Eligible</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} aria-label={`Select ${s.firstName} ${s.lastName}`} />
                </td>
                <td className="px-3 py-2">{s.admissionNumber}</td>
                <td className="px-3 py-2">{s.firstName} {s.lastName}</td>
                <td className="px-3 py-2">{s.section ? `${s.section.course.name} - ${s.section.name}` : "—"}</td>
                <td className="px-3 py-2">
                  {s.tcEligible ? <StatusBadge tone="success">Eligible</StatusBadge> : <StatusBadge tone="neutral">Not eligible</StatusBadge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
