"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { addGalleryItemAction } from "@/server/actions/gallery-actions";

type FormState = { error?: string; success?: boolean };

export function AddGalleryItemForm({ albumId }: { albumId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(addGalleryItemAction, {});
  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="albumId" value={albumId} />
      <FormField id="gi-image" label="Photo" required>
        <Input id="gi-image" name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
      </FormField>
      <FormField id="gi-caption" label="Caption">
        <Input id="gi-caption" name="caption" />
      </FormField>
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Uploading…" : "Add Photo"}
      </Button>
      {state?.error && (
        <p role="alert" className="w-full text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
