import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listExams } from "@/server/services/exams";
import { ExamsTable } from "./exams-table";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("exams.exams", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "startDate", dir: "desc" });
  const { rows, totalCount } = await listExams(params, session.branchId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Exams</h1>
        <p className="text-sm text-muted-foreground">Create exams, map subjects, and set the exam timetable.</p>
      </div>
      <ExamsTable rows={rows} totalCount={totalCount} params={params} />
    </div>
  );
}
