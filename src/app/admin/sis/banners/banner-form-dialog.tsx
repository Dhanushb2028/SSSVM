"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { useCloseOnSuccess } from "@/lib/hooks/use-close-on-success";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-field";
import { createBannerAction } from "@/server/actions/banner-actions";

type FormState = { error?: string; success?: boolean };

export function BannerFormDialog({ branches }: { branches: { id: string; name: string }[] }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createBannerAction, {});
  const [branchId, setBranchId] = React.useState(branches[0]?.id ?? "");
  useCloseOnSuccess(state, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          Add Banner
        </Button>
      </DialogTrigger>
      <DialogContent title="Add Home Banner">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="branchId" value={branchId} />
          <Select value={branchId} onValueChange={setBranchId}>
            <FormField id="banner-branch" label="Branch" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormField>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormField id="banner-image" label="Image" required>
            <Input id="banner-image" name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
          </FormField>
          <FormField id="banner-title" label="Title">
            <Input id="banner-title" name="title" />
          </FormField>
          <FormField id="banner-link" label="Link URL">
            <Input id="banner-link" name="linkUrl" type="url" />
          </FormField>
          <FormField id="banner-order" label="Order">
            <Input id="banner-order" name="orderIndex" type="number" defaultValue={0} />
          </FormField>
          {state?.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
