import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import { FeeComponentForm, FeeComponentList } from "./fee-component-forms";
import { FeeStructureEditor } from "./fee-structure-editor";

export default async function FeeStructurePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("finance.fee_structure", "VIEW");
  const sp = await searchParams;

  const [components, courses, academicYears, branches] = await Promise.all([
    db.feeComponent.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    db.course.findMany({ where: { deletedAt: null }, orderBy: { orderIndex: "asc" } }),
    db.academicYear.findMany({ where: { ...(session.branchId ? { branchId: session.branchId } : {}) }, orderBy: { startDate: "desc" } }),
    db.branch.findMany({ where: { deletedAt: null, ...(session.branchId ? { id: session.branchId } : {}) }, orderBy: { name: "asc" } }),
  ]);

  const branchId = (typeof sp.branchId === "string" ? sp.branchId : undefined) ?? branches[0]?.id;
  const courseId = (typeof sp.courseId === "string" ? sp.courseId : undefined) ?? courses[0]?.id;
  const academicYearId = (typeof sp.academicYearId === "string" ? sp.academicYearId : undefined) ?? academicYears[0]?.id;

  const existing =
    branchId && courseId && academicYearId
      ? await db.feeStructure.findMany({ where: { branchId, courseId, academicYearId } })
      : [];
  const existingAmounts = Object.fromEntries(existing.map((e) => [e.feeComponentId, e.amount]));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Fee Structure</h1>
        <p className="text-sm text-muted-foreground">Define fee components, then set the amount each course owes per academic year.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Components</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FeeComponentForm />
          <FeeComponentList items={components} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Structure by Course &amp; Year</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <UrlFilterSelect paramKey="branchId" placeholder="Branch" options={branches.map((b) => ({ value: b.id, label: b.name }))} />
            <UrlFilterSelect paramKey="courseId" placeholder="Course" options={courses.map((c) => ({ value: c.id, label: c.name }))} />
            <UrlFilterSelect
              paramKey="academicYearId"
              placeholder="Academic Year"
              options={academicYears.map((y) => ({ value: y.id, label: y.name }))}
            />
          </div>
          {branchId && courseId && academicYearId ? (
            <FeeStructureEditor
              branchId={branchId}
              courseId={courseId}
              academicYearId={academicYearId}
              components={components}
              existingAmounts={existingAmounts}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Select a branch, course, and academic year above.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
