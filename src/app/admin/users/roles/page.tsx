import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listPermissionProfiles } from "@/server/services/permission-profiles";
import { RolesTable } from "./roles-table";

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermissionOrRedirect("users.roles", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "name", dir: "asc" });
  const { rows, totalCount } = await listPermissionProfiles(params);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Roles &amp; Permission Profiles</h1>
        <p className="text-sm text-muted-foreground">
          Scope staff to a subset of admin modules — e.g. a Front Office or Finance Staff role — without creating a
          new top-level role. An admin with no role assigned has full access to everything.
        </p>
      </div>
      <RolesTable rows={rows} totalCount={totalCount} params={params} />
    </div>
  );
}
