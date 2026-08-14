import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listOrganizations } from "@/server/services/organizations";
import { OrganizationsTable } from "./organizations-table";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("system.organizations", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "name", dir: "asc" });
  const { rows, totalCount } = await listOrganizations(params);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Organizations</h1>
        <p className="text-sm text-muted-foreground">Manage the organizations operating under this deployment.</p>
      </div>
      <OrganizationsTable rows={rows} totalCount={totalCount} params={params} />
    </div>
  );
}
