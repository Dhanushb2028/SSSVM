import { format } from "date-fns";
import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";
import { listOutgoingStudents } from "@/server/services/outgoing-students";
import { toCsvResponse } from "@/lib/data-table/csv";
import { parseTableParams } from "@/lib/data-table/params";

export async function GET(request: Request) {
  let session;
  try {
    session = await requirePermission("sis.outgoing", "EXPORT");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }
  const { searchParams } = new URL(request.url);
  const params = parseTableParams(Object.fromEntries(searchParams), { pageSize: 100000 });
  const { rows } = await listOutgoingStudents(params, session.branchId);

  return toCsvResponse(
    rows.map((r) => ({
      "Admission No.": r.admissionNumber,
      Name: `${r.firstName} ${r.lastName}`,
      Branch: r.branch.name,
      "Left On": r.leftDate ? format(r.leftDate, "yyyy-MM-dd") : "",
      Reason: r.leftReason ?? "",
    })),
    "outgoing-students.csv",
  );
}
