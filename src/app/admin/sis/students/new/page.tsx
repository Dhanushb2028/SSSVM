import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { listStudentFilterData } from "@/server/services/students";
import { db } from "@/lib/db";
import { StudentForm } from "../student-form";

export default async function NewStudentPage() {
  const session = await requirePermissionOrRedirect("sis.students", "CREATE");
  const filterData = await listStudentFilterData(session.branchId);
  const sections = await db.section.findMany({
    where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
    include: { course: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Add Student</h1>
        <p className="text-sm text-muted-foreground">Create a new student master record.</p>
      </div>
      <StudentForm mode="create" branches={filterData.branches} sections={sections} />
    </div>
  );
}
