"use client";

import * as React from "react";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveSalaryStructureAction } from "@/server/actions/payroll-actions";

type FormState = { error?: string; success?: boolean };
type Component = { id: string; name: string; type: string };

export function SalaryStructureEditor({
  staffMemberId,
  components,
  existingAmounts,
}: {
  staffMemberId: string;
  components: Component[];
  existingAmounts: Record<string, number>;
}) {
  const [amounts, setAmounts] = React.useState<Record<string, string>>(
    Object.fromEntries(components.map((c) => [c.id, existingAmounts[c.id] ? String(existingAmounts[c.id]) : ""])),
  );
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveSalaryStructureAction, {});

  const [prevStaffId, setPrevStaffId] = React.useState(staffMemberId);
  if (staffMemberId !== prevStaffId) {
    setPrevStaffId(staffMemberId);
    setAmounts(Object.fromEntries(components.map((c) => [c.id, existingAmounts[c.id] ? String(existingAmounts[c.id]) : ""])));
  }

  const rowsJson = JSON.stringify(
    components
      .filter((c) => amounts[c.id] !== "" && amounts[c.id] !== undefined)
      .map((c) => ({ salaryComponentId: c.id, amount: amounts[c.id] })),
  );

  const gross = components
    .filter((c) => c.type === "EARNING")
    .reduce((sum, c) => sum + (Number(amounts[c.id]) || 0), 0);
  const deductions = components
    .filter((c) => c.type === "DEDUCTION")
    .reduce((sum, c) => sum + (Number(amounts[c.id]) || 0), 0);

  if (components.length === 0) {
    return <p className="text-sm text-muted-foreground">Add salary components first.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="staffMemberId" value={staffMemberId} />
      <input type="hidden" name="rows" value={rowsJson} />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[400px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Component</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  {c.name} <span className="text-muted-foreground">({c.type === "EARNING" ? "Earning" : "Deduction"})</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Input
                    type="number"
                    min={0}
                    className="w-28 text-right"
                    aria-label={`Amount for ${c.name}`}
                    value={amounts[c.id] ?? ""}
                    onChange={(e) => setAmounts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-foreground font-medium">
              <td className="px-3 py-2">Gross / Deductions</td>
              <td className="px-3 py-2 text-right">
                ₹{gross} / ₹{deductions}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving…" : "Save Salary Structure"}
        </Button>
        {state?.success && <span className="text-sm text-success">Saved</span>}
      </div>
    </form>
  );
}
