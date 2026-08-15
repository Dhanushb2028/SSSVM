import Link from "next/link";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listTcStudents } from "@/server/services/certificates";
import { db } from "@/lib/db";
import { TcTable } from "./tc-table";

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("certificates.tc", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "firstName", dir: "asc" });
  const courseId = typeof sp.courseId === "string" ? sp.courseId : undefined;

  const [{ rows, totalCount }, courses] = await Promise.all([
    listTcStudents(params, session.branchId, { issued: false, courseId }),
    db.course.findMany({ where: { deletedAt: null }, orderBy: { orderIndex: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Transfer Certificates</h1>
          <p className="text-sm text-muted-foreground">
            Students eligible for TC issuance (via Certificate Permission) who haven&apos;t been issued one yet.
          </p>
        </div>
        <Link href="/admin/certificates/issued" className="text-sm text-primary hover:underline">
          View issued TCs →
        </Link>
      </div>
      <TcTable rows={rows} totalCount={totalCount} params={params} issued={false} courses={courses} />
    </div>
  );
}
