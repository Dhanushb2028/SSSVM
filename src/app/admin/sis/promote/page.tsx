import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { promoteStudentsAction } from "@/server/actions/promote-actions";
import { SectionPickerSelect } from "../_shared/section-picker-select";
import { BulkMoverForm } from "../_shared/bulk-mover-form";

export default async function PromotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("sis.promote", "EDIT");
  const sp = await searchParams;
  const sourceSectionId = typeof sp.sourceSectionId === "string" ? sp.sourceSectionId : undefined;

  const sections = await db.section.findMany({
    where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
    include: { course: true, branch: true, academicYear: true },
    orderBy: [{ academicYear: { startDate: "desc" } }, { name: "asc" }],
  });

  const students = sourceSectionId
    ? await db.student.findMany({
        where: { sectionId: sourceSectionId, status: "ACTIVE", deletedAt: null },
        orderBy: { firstName: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Promote Students</h1>
        <p className="text-sm text-muted-foreground">
          Move an entire section&apos;s active students into a section for the next academic year. Review the roster and
          confirm before anything is changed.
        </p>
      </div>

      <SectionPickerSelect paramKey="sourceSectionId" label="Select source section" sections={sections} />

      <BulkMoverForm students={students} targetSections={sections} action={promoteStudentsAction} confirmVerb="Promote" />
    </div>
  );
}
