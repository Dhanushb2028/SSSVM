import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listBranches, listOrganizationsForPicker } from "@/server/services/branches";
import { BranchesTable } from "./branches-table";

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("system.branches", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "name", dir: "asc" });
  const [{ rows, totalCount }, organizations] = await Promise.all([
    listBranches(params, session.branchId),
    listOrganizationsForPicker(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Branches</h1>
        <p className="text-sm text-muted-foreground">Manage school branches and their basic details.</p>
      </div>
      <BranchesTable rows={rows} totalCount={totalCount} params={params} organizations={organizations} />
    </div>
  );
}
