import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listOutgoingStudents } from "@/server/services/outgoing-students";
import { OutgoingTable } from "./outgoing-table";

export default async function OutgoingStudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("sis.outgoing", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "leftDate", dir: "desc" });
  const { rows, totalCount } = await listOutgoingStudents(params, session.branchId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Outgoing Students</h1>
        <p className="text-sm text-muted-foreground">
          Students who have left the school. Outstanding-dues figures will populate once the Finance module ships.
        </p>
      </div>
      <OutgoingTable rows={rows} totalCount={totalCount} params={params} />
    </div>
  );
}
