import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { toCsvResponse } from "@/lib/data-table/csv";
import { format } from "date-fns";

export async function GET(request: Request) {
  let session;
  try {
    session = await requirePermission("admissions.reports", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const branchId = session.branchId ?? (await db.branch.findFirst({ where: { deletedAt: null } }))?.id;
  if (!branchId) return new Response("No branch", { status: 400 });

  const admitted = await db.admissionEnquiry.findMany({
    where: {
      branchId,
      status: "ADMITTED",
      ...(dateFrom || dateTo
        ? { updatedAt: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), ...(dateTo ? { lte: new Date(dateTo) } : {}) } }
        : {}),
    },
    include: { assignedMeo: true, course: true },
  });

  return toCsvResponse(
    admitted.map((e) => ({
      "Student Name": e.studentName,
      "Parent Name": e.parentName,
      Course: e.course?.name ?? "",
      MEO: e.assignedMeo ? `${e.assignedMeo.firstName} ${e.assignedMeo.lastName}` : "",
      "Fee Commitment": e.feeCommitment ?? "",
      "Admitted On": format(e.updatedAt, "yyyy-MM-dd"),
    })),
    "admissions-report.csv",
  );
}
