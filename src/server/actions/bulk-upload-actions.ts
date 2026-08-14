"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac/permissions";
import { bulkUploadStudents, type BulkUploadResult } from "@/server/services/student-bulk-upload";
import { recordAudit } from "@/server/services/audit";

export type BulkUploadState = BulkUploadResult & { error?: string };

const initialState: BulkUploadState = { createdCount: 0, errors: [] };

export async function bulkUploadStudentsAction(_prev: BulkUploadState, formData: FormData): Promise<BulkUploadState> {
  const session = await requirePermission("sis.bulk_upload", "CREATE");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ...initialState, error: "Choose a CSV file to upload." };
  }

  const text = await file.text();
  const result = await bulkUploadStudents(text, session.branchId);

  await recordAudit({
    actorId: session.userId,
    action: "student.bulk_upload",
    entityType: "Student",
    metadata: { createdCount: result.createdCount, errorCount: result.errors.length },
  });

  revalidatePath("/admin/sis/students");
  return result;
}
