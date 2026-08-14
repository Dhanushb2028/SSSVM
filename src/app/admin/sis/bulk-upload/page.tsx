import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { BulkUploadForm } from "./bulk-upload-form";

export default async function BulkUploadPage() {
  await requirePermissionOrRedirect("sis.bulk_upload", "CREATE");

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Bulk Upload Students</h1>
        <p className="text-sm text-muted-foreground">
          Upload a CSV of student master data. Every row is validated before anything is written — rejected rows are
          reported so you can fix and re-upload just those, and every accepted row is created.
        </p>
      </div>
      <BulkUploadForm />
    </div>
  );
}
