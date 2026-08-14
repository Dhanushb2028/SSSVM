"use client";

import * as React from "react";
import { MODULE_GROUPS, PERMISSION_ACTIONS } from "@/lib/rbac/modules";
import { Checkbox } from "@/components/ui/checkbox";

export type GrantKey = `${string}::${string}`;

/** The module × action permission grid used to build a PermissionProfile (Section 6.2). */
export function PermissionGrid({ initialGrants }: { initialGrants: Set<GrantKey> }) {
  const [checked, setChecked] = React.useState<Set<GrantKey>>(initialGrants);

  function toggle(key: GrantKey) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {Array.from(checked).map((key) => (
        <input key={key} type="hidden" name="grant" value={key} />
      ))}
      {MODULE_GROUPS.map((group) => (
        <fieldset key={group.group} className="rounded-md border border-border p-3">
          <legend className="px-1 text-sm font-semibold text-foreground">{group.group}</legend>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className="py-1 text-left font-normal text-muted-foreground">
                    Module
                  </th>
                  {PERMISSION_ACTIONS.map((action) => (
                    <th key={action} scope="col" className="py-1 text-center font-normal text-muted-foreground">
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.modules.map((mod) => (
                  <tr key={mod.key} className="border-t border-border">
                    <th scope="row" className="py-1.5 text-left font-normal text-foreground">
                      {mod.label}
                    </th>
                    {PERMISSION_ACTIONS.map((action) => {
                      const key: GrantKey = `${mod.key}::${action}`;
                      return (
                        <td key={action} className="py-1.5 text-center">
                          <Checkbox
                            checked={checked.has(key)}
                            onCheckedChange={() => toggle(key)}
                            aria-label={`${mod.label} - ${action}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>
      ))}
    </div>
  );
}
