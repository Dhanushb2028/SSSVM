"use client";

import * as React from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { markStaffAttendanceAction } from "@/server/actions/staff-attendance-actions";

type Status = "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_DUTY" | "LEAVE";
type RosterStaff = { id: string; employeeCode: string; firstName: string; lastName: string; status: Status };

type FormState = { error?: string; success?: boolean };

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "HALF_DAY", label: "Half day" },
  { value: "ON_DUTY", label: "On duty" },
  { value: "LEAVE", label: "Leave" },
];

export function StaffAttendanceBoard({ branchId, date, roster }: { branchId: string; date: string; roster: RosterStaff[] }) {
  const [statuses, setStatuses] = React.useState<Record<string, Status>>(
    Object.fromEntries(roster.map((s) => [s.id, s.status])),
  );
  const [state, formAction, pending] = useActionState<FormState, FormData>(markStaffAttendanceAction, {});

  const [prevRoster, setPrevRoster] = React.useState(roster);
  if (roster !== prevRoster) {
    setPrevRoster(roster);
    setStatuses(Object.fromEntries(roster.map((s) => [s.id, s.status])));
  }

  const recordsJson = JSON.stringify(
    roster.map((s) => ({ staffMemberId: s.id, status: statuses[s.id] ?? "PRESENT" })),
  );
  const notPresent = roster.filter((s) => statuses[s.id] && statuses[s.id] !== "PRESENT");

  if (roster.length === 0) {
    return <p className="text-sm text-muted-foreground">No active staff found for this branch.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="branchId" value={branchId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="records" value={recordsJson} />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Code</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">{s.employeeCode}</td>
                <td className="px-3 py-2">{s.firstName} {s.lastName}</td>
                <td className="px-3 py-2">
                  <fieldset className="flex flex-wrap gap-3">
                    <legend className="sr-only">Attendance status for {s.firstName} {s.lastName}</legend>
                    {STATUS_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-1 text-xs">
                        <input
                          type="radio"
                          name={`status-${s.id}`}
                          value={opt.value}
                          checked={(statuses[s.id] ?? "PRESENT") === opt.value}
                          onChange={() => setStatuses((prev) => ({ ...prev, [s.id]: opt.value }))}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </fieldset>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving…" : "Save Attendance"}
        </Button>
        {state?.success && (
          <StatusBadge tone="success" role="status">
            Saved
          </StatusBadge>
        )}
      </div>

      <div aria-live="polite">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Not present / OD ({notPresent.length})</h2>
        {notPresent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Everyone is marked present.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {notPresent.map((s) => (
              <li key={s.id} className="flex items-center gap-2 text-sm">
                <StatusBadge tone={statuses[s.id] === "ABSENT" ? "danger" : "warning"}>
                  {STATUS_OPTIONS.find((o) => o.value === statuses[s.id])?.label}
                </StatusBadge>
                {s.firstName} {s.lastName} ({s.employeeCode})
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
