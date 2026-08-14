import { format } from "date-fns";
import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listAllAcademicYearsForExport } from "@/server/services/academic-years";
import { toCsvResponse } from "@/lib/data-table/csv";

export async function GET(request: Request) {
  let session;
  try {
    session = await requirePermission("system.academic_years", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const q = new URL(request.url).searchParams.get("q") ?? "";
  const rows = await listAllAcademicYearsForExport(q, session.branchId);
  return toCsvResponse(
    rows.map((r) => ({
      Name: r.name,
      Branch: r.branch.name,
      Start: format(r.startDate, "yyyy-MM-dd"),
      End: format(r.endDate, "yyyy-MM-dd"),
      Current: r.isCurrent ? "Yes" : "No",
    })),
    "academic-years.csv",
  );
}
