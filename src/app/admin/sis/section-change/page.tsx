import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { changeStudentSectionAction } from "@/server/actions/promote-actions";
import { SectionPickerSelect } from "@/components/shared/section-picker-select";
import { BulkMoverForm } from "@/components/shared/bulk-mover-form";

export default async function SectionChangePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("sis.section_change", "EDIT");
  const sp = await searchParams;
  const sourceSectionId = typeof sp.sourceSectionId === "string" ? sp.sourceSectionId : undefined;

  const sections = await db.section.findMany({
    where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
    include: { course: true, branch: true },
    orderBy: { name: "asc" },
  });

  const students = sourceSectionId
    ? await db.student.findMany({
        where: { sectionId: sourceSectionId, deletedAt: null },
        orderBy: { firstName: "asc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Section Change</h1>
        <p className="text-sm text-muted-foreground">
          Move a group of students from one section to another within the same academic year.
        </p>
      </div>

      <SectionPickerSelect paramKey="sourceSectionId" label="Select source section" sections={sections} />

      <BulkMoverForm students={students} targetSections={sections} action={changeStudentSectionAction} confirmVerb="Move" />
    </div>
  );
}
