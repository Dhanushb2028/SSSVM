import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { getCourseAbstract } from "@/server/services/sis-reports";
import { toCsvResponse } from "@/lib/data-table/csv";

export async function GET() {
  let session;
  try {
    session = await requirePermission("sis.reports", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }
  const rows = await getCourseAbstract(session.branchId);
  return toCsvResponse(
    rows.map((r) => ({ Branch: r.branch, Course: r.course, Sections: r.sectionCount, Strength: r.strength })),
    "course-abstract.csv",
  );
}
