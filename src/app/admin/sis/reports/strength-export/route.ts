import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { getSectionStrength } from "@/server/services/sis-reports";
import { toCsvResponse } from "@/lib/data-table/csv";

export async function GET() {
  let session;
  try {
    session = await requirePermission("sis.reports", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }
  const rows = await getSectionStrength(session.branchId);
  return toCsvResponse(
    rows.map((r) => ({ Branch: r.branch, Course: r.course, Section: r.section, Strength: r.strength, Capacity: r.capacity ?? "" })),
    "section-strength.csv",
  );
}
