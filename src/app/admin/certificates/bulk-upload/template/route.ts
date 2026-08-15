import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";

const HEADER =
  "admissionNumber,fatherName,motherName,nationality,category\n" +
  "SSSVM2025-001,Ramesh Kumar,Sita Kumar,Indian,General\n";

export async function GET() {
  try {
    await requirePermission("certificates.tc", "VIEW");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }
  return new Response(HEADER, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="cbse-data-template.csv"' },
  });
}
