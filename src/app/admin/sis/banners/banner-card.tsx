"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { toggleBannerActiveAction, deleteBannerAction } from "@/server/actions/banner-actions";

type FormState = { error?: string; success?: boolean };

export function BannerCard({
  banner,
}: {
  banner: { id: string; title: string | null; imageUrl: string; isActive: boolean; branch: { name: string } };
}) {
  const [, toggleAction, togglePending] = useActionState<FormState, FormData>(toggleBannerActiveAction, {});

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <Image src={banner.imageUrl} alt={banner.title ?? ""} width={640} height={240} className="h-32 w-full object-cover" />
      <div className="flex items-center justify-between gap-2 p-3">
        <div>
          <p className="text-sm font-medium text-foreground">{banner.title || "Untitled"}</p>
          <p className="text-xs text-muted-foreground">{banner.branch.name}</p>
        </div>
        <div className="flex items-center gap-1">
          {banner.isActive ? <StatusBadge tone="success">Active</StatusBadge> : <StatusBadge tone="neutral">Hidden</StatusBadge>}
          <form action={toggleAction}>
            <input type="hidden" name="id" value={banner.id} />
            <Button type="submit" variant="ghost" size="sm" disabled={togglePending}>
              {banner.isActive ? "Hide" : "Show"}
            </Button>
          </form>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" aria-label="Delete banner">
                <Trash2 aria-hidden="true" className="text-danger" />
              </Button>
            }
            title="Delete banner"
            description="Delete this home banner? This can't be undone."
            confirmLabel="Delete"
            action={deleteBannerAction}
            hiddenFields={{ id: banner.id }}
          />
        </div>
      </div>
    </div>
  );
}
