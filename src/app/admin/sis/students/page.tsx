import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePermissionOrRedirect, hasPermission } from "@/lib/rbac/permissions";
import { parseTableParams } from "@/lib/data-table/params";
import { listStudents, listStudentFilterData } from "@/server/services/students";
import { Button } from "@/components/ui/button";
import { StudentsTable } from "./students-table";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("sis.students", "VIEW");
  const sp = await searchParams;
  const params = parseTableParams(sp, { sort: "firstName", dir: "asc" });
  const courseId = typeof sp.courseId === "string" ? sp.courseId : undefined;
  const sectionId = typeof sp.sectionId === "string" ? sp.sectionId : undefined;

  const [{ rows, totalCount }, filterData] = await Promise.all([
    listStudents(params, session.branchId, { courseId, sectionId }),
    listStudentFilterData(session.branchId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Student Master</h1>
          <p className="text-sm text-muted-foreground">Search and manage student records.</p>
        </div>
        {hasPermission(session, "sis.students", "CREATE") && (
          <Button asChild size="sm">
            <Link href="/admin/sis/students/new">
              <Plus aria-hidden="true" />
              Add Student
            </Link>
          </Button>
        )}
      </div>
      <StudentsTable rows={rows} totalCount={totalCount} params={params} courses={filterData.courses} sections={filterData.sections} />
    </div>
  );
}
