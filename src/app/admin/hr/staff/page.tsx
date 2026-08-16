import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { parseTableParams } from "@/lib/data-table/params";
import { listStaff } from "@/server/services/staff";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import { StaffTable } from "./staff-table";

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("hr.staff", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "firstName", dir: "asc" });
  const status = typeof sp.status === "string" ? sp.status : undefined;

  const [{ rows, totalCount }, branches] = await Promise.all([
    listStaff(params, session.branchId, { status }),
    db.branch.findMany({ where: { deletedAt: null, ...(session.branchId ? { id: session.branchId } : {}) }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Staff Master</h1>
        <p className="text-sm text-muted-foreground">Teaching and non-teaching staff records.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <UrlFilterSelect
          paramKey="status"
          placeholder="Status"
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "LEFT", label: "Left" },
          ]}
        />
      </div>
      <StaffTable rows={rows} totalCount={totalCount} params={params} branches={branches} status={status} />
    </div>
  );
}
