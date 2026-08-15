"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac/permissions";
import { bulkUploadCbseData, type CbseUploadResult } from "@/server/services/cbse-bulk-upload";
import { recordAudit } from "@/server/services/audit";

export type CbseUploadState = CbseUploadResult & { error?: string };

const initialState: CbseUploadState = { updatedCount: 0, errors: [] };

export async function bulkUploadCbseAction(_prev: CbseUploadState, formData: FormData): Promise<CbseUploadState> {
  const session = await requirePermission("certificates.tc", "CREATE");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ...initialState, error: "Choose a CSV file to upload." };
  }

  const text = await file.text();
  const result = await bulkUploadCbseData(text, session.branchId);

  await recordAudit({
    actorId: session.userId,
    action: "cbse_data.bulk_upload",
    entityType: "Student",
    metadata: { updatedCount: result.updatedCount, errorCount: result.errors.length },
  });

  revalidatePath("/admin/certificates");
  return result;
}
