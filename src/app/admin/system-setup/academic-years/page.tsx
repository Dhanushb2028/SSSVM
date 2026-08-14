import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listAcademicYears, listBranchesForPicker } from "@/server/services/academic-years";
import { AcademicYearsTable } from "./academic-years-table";

export default async function AcademicYearsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("system.academic_years", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "startDate", dir: "desc" });
  const [{ rows, totalCount }, branches] = await Promise.all([
    listAcademicYears(params, session.branchId),
    listBranchesForPicker(session.branchId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Academic Years</h1>
        <p className="text-sm text-muted-foreground">Manage academic years and mark the current one per branch.</p>
      </div>
      <AcademicYearsTable rows={rows} totalCount={totalCount} params={params} branches={branches} />
    </div>
  );
}
