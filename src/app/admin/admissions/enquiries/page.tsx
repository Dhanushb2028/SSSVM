import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { EnquiryBoard } from "@/components/shared/enquiry-board";
import { EnquiryFormDialog } from "./enquiry-form-dialog";

const COLUMNS = ["NEW", "CONTACTED", "VISITED", "APPLIED", "ADMITTED", "LOST"];

export default async function EnquiriesPage() {
  const session = await requirePermissionOrRedirect("admissions.enquiries", "VIEW");
  const branch = session.branchId
    ? await db.branch.findUnique({ where: { id: session.branchId } })
    : await db.branch.findFirst({ where: { deletedAt: null } });
  const [courses, meos] = await Promise.all([
    db.course.findMany({ where: { deletedAt: null }, orderBy: { orderIndex: "asc" } }),
    branch ? db.marketingOfficer.findMany({ where: { branchId: branch.id, deletedAt: null } }) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Admission Enquiries</h1>
          <p className="text-sm text-muted-foreground">Track prospective students through the enquiry pipeline.</p>
        </div>
        {branch && <EnquiryFormDialog branchId={branch.id} courses={courses} meos={meos} />}
      </div>
      {branch && <EnquiryBoard branchId={branch.id} columns={COLUMNS} />}
    </div>
  );
}
