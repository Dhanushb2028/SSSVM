"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

export function SectionMultiFilter({
  sections,
}: {
  sections: { id: string; name: string; course: { name: string } }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = new Set((searchParams.get("sectionIds") ?? "").split(",").filter(Boolean));

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const params = new URLSearchParams(searchParams.toString());
    if (next.size > 0) params.set("sectionIds", Array.from(next).join(","));
    else params.delete("sectionIds");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <fieldset className="flex flex-wrap gap-3 rounded-md border border-border p-3">
      <legend className="px-1 text-xs font-medium text-muted-foreground">Sections (all if none selected)</legend>
      {sections.map((s) => (
        <label key={s.id} className="flex items-center gap-1.5 text-sm">
          <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
          {s.course.name} - {s.name}
        </label>
      ))}
    </fieldset>
  );
}
