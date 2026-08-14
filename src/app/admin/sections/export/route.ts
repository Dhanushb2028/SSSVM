import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listSections } from "@/server/services/sections";
import { toCsvResponse } from "@/lib/data-table/csv";
import { parseTableParams } from "@/lib/data-table/params";

export async function GET(request: Request) {
  let session;
  try {
    session = await requirePermission("sections.manage", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const params = parseTableParams(Object.fromEntries(searchParams), { pageSize: 100000 });
  const { rows } = await listSections(params, session.branchId);

  return toCsvResponse(
    rows.map((r) => ({
      Course: r.course.name,
      Section: r.name,
      Branch: r.branch.name,
      "Academic Year": r.academicYear.name,
      "Class Teacher": r.classTeacher ? `${r.classTeacher.firstName} ${r.classTeacher.lastName}` : "",
      Strength: r._count.students,
      Capacity: r.capacity ?? "",
    })),
    "sections.csv",
  );
}
