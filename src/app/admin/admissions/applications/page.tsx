import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { EnquiryBoard } from "@/components/shared/enquiry-board";

const COLUMNS = ["APPLIED", "ADMITTED"];

export default async function ApplicationsPage() {
  const session = await requirePermissionOrRedirect("admissions.applications", "VIEW");
  const branch = session.branchId
    ? await db.branch.findUnique({ where: { id: session.branchId } })
    : await db.branch.findFirst({ where: { deletedAt: null } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Applications</h1>
        <p className="text-sm text-muted-foreground">Enquiries that have applied, with one-click conversion to admission.</p>
      </div>
      {branch && <EnquiryBoard branchId={branch.id} columns={COLUMNS} />}
    </div>
  );
}
