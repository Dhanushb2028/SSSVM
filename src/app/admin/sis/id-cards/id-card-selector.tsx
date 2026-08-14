"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type StudentRow = { id: string; admissionNumber: string; firstName: string; lastName: string };

export function IdCardSelector({ students }: { students: StudentRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground">Select a section above with active students.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th scope="col" className="w-10 px-3 py-2">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Admission No.</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        className="w-fit"
        disabled={selected.size === 0}
        onClick={() => router.push(`/admin/sis/id-cards/print?ids=${Array.from(selected).join(",")}`)}
      >
        Generate {selected.size} ID Card(s)
      </Button>
    </div>
  );
}
