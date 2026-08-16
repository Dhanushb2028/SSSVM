import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listAllAcademicYearsForExport } from "@/server/services/academic-years";
import { toCsvResponse } from "@/lib/data-table/csv";
import { formatDateOnly } from "@/lib/date";

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
      Start: formatDateOnly(r.startDate, "yyyy-MM-dd"),
      End: formatDateOnly(r.endDate, "yyyy-MM-dd"),
      Current: r.isCurrent ? "Yes" : "No",
    })),
    "academic-years.csv",
  );
}
