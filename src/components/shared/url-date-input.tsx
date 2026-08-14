"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function UrlDateInput({ paramKey, label, fallback }: { paramKey: string; label: string; fallback?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? fallback ?? "";

  function onChange(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(paramKey, value);
    else next.delete(paramKey);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <Input type="date" value={current} onChange={(e) => onChange(e.target.value)} className="w-44" />
    </label>
  );
}
