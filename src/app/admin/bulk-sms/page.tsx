import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { BulkSmsForm } from "./bulk-sms-form";

export default async function BulkSmsPage() {
  const session = await requirePermissionOrRedirect("comms.sms", "CREATE");
  const branchId = session.branchId ?? (await db.branch.findFirst({ where: { deletedAt: null } }))?.id;
  const courses = await db.course.findMany({ where: { deletedAt: null }, orderBy: { orderIndex: "asc" } });

  if (!branchId) return <p className="text-sm text-muted-foreground">No branch exists yet.</p>;

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Bulk SMS</h1>
        <p className="text-sm text-muted-foreground">Send a templated SMS to a broad group of guardians. Every send is confirmed and audit-logged.</p>
      </div>
      <BulkSmsForm branchId={branchId} courses={courses} />
    </div>
  );
}
