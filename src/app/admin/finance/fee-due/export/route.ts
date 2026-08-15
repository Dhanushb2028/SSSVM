import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { getFeeDueReport } from "@/server/services/fees";
import { toCsvResponse } from "@/lib/data-table/csv";

export async function GET(request: Request) {
  try {
    await requirePermission("finance.reports", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId") ?? "";
  const academicYearId = searchParams.get("academicYearId") ?? "";
  if (!branchId || !academicYearId) return new Response("Missing params", { status: 400 });

  const rows = await getFeeDueReport(branchId, academicYearId);
  return toCsvResponse(
    rows.map((r) => ({
      "Admission No.": r.student.admissionNumber,
      Name: `${r.student.firstName} ${r.student.lastName}`,
      "Total Due": r.totalDue,
      Paid: r.totalPaid,
      Balance: r.balance,
    })),
    "fee-due-report.csv",
  );
}
