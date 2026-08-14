import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listStudents } from "@/server/services/students";
import { toCsvResponse } from "@/lib/data-table/csv";
import { parseTableParams } from "@/lib/data-table/params";

export async function GET(request: Request) {
  let session;
  try {
    session = await requirePermission("sis.students", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const params = parseTableParams(Object.fromEntries(searchParams), { pageSize: 100000 });
  const { rows } = await listStudents(params, session.branchId, {
    courseId: searchParams.get("courseId") ?? undefined,
    sectionId: searchParams.get("sectionId") ?? undefined,
  });

  return toCsvResponse(
    rows.map((r) => ({
      "Admission No.": r.admissionNumber,
      Name: `${r.firstName} ${r.lastName}`,
      Course: r.section?.course.name ?? "",
      Section: r.section?.name ?? "",
      Branch: r.branch.name,
      Status: r.status,
    })),
    "students.csv",
  );
}
