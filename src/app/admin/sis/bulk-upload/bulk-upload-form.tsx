"use client";

import { useActionState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { bulkUploadStudentsAction, type BulkUploadState } from "@/server/actions/bulk-upload-actions";

const initialState: BulkUploadState = { createdCount: 0, errors: [] };

export function BulkUploadForm() {
  const [state, formAction, pending] = useActionState(bulkUploadStudentsAction, initialState);

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="secondary" size="sm" className="w-fit">
        <a href="/admin/sis/bulk-upload/template">
          <Download aria-hidden="true" />
          Download CSV template
        </a>
      </Button>

      <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-4">
        <FormField id="file" label="Student CSV file" required>
          <Input id="file" name="file" type="file" accept=".csv,text/csv" required />
        </FormField>
        {state.error && (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </form>

      {(state.createdCount > 0 || state.errors.length > 0) && !state.error && (
        <div className="flex flex-col gap-3" aria-live="polite">
          <StatusBadge tone={state.createdCount > 0 ? "success" : "warning"} className="w-fit">
            {state.createdCount} student(s) created
          </StatusBadge>
          {state.errors.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                {state.errors.length} row(s) were rejected — nothing else was silently dropped:
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background">
                      <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Row
                      </th>
                      <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.errors.map((e, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 text-foreground">{e.row || "—"}</td>
                        <td className="px-3 py-2 text-danger">{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
