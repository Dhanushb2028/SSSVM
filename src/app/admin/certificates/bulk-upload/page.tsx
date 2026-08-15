import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { BulkUploadCbseForm } from "./bulk-upload-cbse-form";

export default async function CbseBulkUploadPage() {
  await requirePermissionOrRedirect("certificates.tc", "CREATE");

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Bulk Upload CBSE Data</h1>
        <p className="text-sm text-muted-foreground">
          Backfill CBSE-format student data (father/mother name, nationality, category) ahead of Transfer Certificate issuance.
        </p>
      </div>
      <BulkUploadCbseForm />
    </div>
  );
}
