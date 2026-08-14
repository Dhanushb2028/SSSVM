import { requirePermission, toHttpResponse } from "@/lib/rbac/permissions";

const HEADER =
  "admissionNumber,firstName,lastName,dob,gender,branchName,courseName,sectionName,admissionDate,contactPhone,contactEmail,bloodGroup,address\n" +
  "SSSVM2026-101,Example,Student,2016-05-14,MALE,K.R.M. Colony Main Campus,Grade 5,A,2026-06-01,9000000000,,,\n";

export async function GET() {
  try {
    await requirePermission("sis.bulk_upload", "VIEW");
  } catch (e) {
    return toHttpResponse(e) ?? new Response("Error", { status: 500 });
  }
  return new Response(HEADER, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="student-bulk-upload-template.csv"' },
  });
}
