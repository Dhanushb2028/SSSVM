"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** URL-driven "pick a section" control — selecting one reloads the page with a fresh server-fetched roster. */
export function SectionPickerSelect({
  paramKey,
  label,
  sections,
}: {
  paramKey: string;
  label: string;
  sections: { id: string; name: string; course: { name: string }; branch: { name: string } }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "";

  function onChange(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set(paramKey, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-72" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {sections.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.branch.name} · {s.course.name} - {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
