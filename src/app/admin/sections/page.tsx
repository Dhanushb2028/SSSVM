import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listSections, listSectionPickerData } from "@/server/services/sections";
import { SectionsTable } from "./sections-table";

export default async function SectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("sections.manage", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "name", dir: "asc" });
  const [{ rows, totalCount }, picker] = await Promise.all([
    listSections(params, session.branchId),
    listSectionPickerData(session.branchId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Sections</h1>
        <p className="text-sm text-muted-foreground">Map sections to a course, branch, and academic year.</p>
      </div>
      <SectionsTable rows={rows} totalCount={totalCount} params={params} picker={picker} />
    </div>
  );
}
