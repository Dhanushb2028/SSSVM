import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listTrashedStudents } from "@/server/services/students";
import { TrashTable } from "./trash-table";

export default async function StudentTrashPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("sis.trash", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "firstName", dir: "asc" });
  const { rows, totalCount } = await listTrashedStudents(params, session.branchId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Trash</h1>
        <p className="text-sm text-muted-foreground">Soft-deleted student records. Restore any of them at any time.</p>
      </div>
      <TrashTable rows={rows} totalCount={totalCount} params={params} />
    </div>
  );
}
