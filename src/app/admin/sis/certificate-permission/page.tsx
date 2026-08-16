import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { CertificatePermissionForm } from "./certificate-permission-form";

export default async function CertificatePermissionPage() {
  const session = await requirePermissionOrRedirect("sis.certificate_permission", "VIEW");
  const students = await db.student.findMany({
    where: {
      deletedAt: null,
      status: "ACTIVE",
      sectionId: { not: null },
      ...(session.branchId ? { branchId: session.branchId } : {}),
    },
    include: { section: { include: { course: true } } },
    orderBy: { firstName: "asc" },
    take: 500,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Certificate Permission</h1>
        <p className="text-sm text-muted-foreground">
          A guardrail before Transfer Certificate issuance — only eligible students can have a TC generated (Phase 7).
        </p>
      </div>
      <CertificatePermissionForm students={students} />
    </div>
  );
}
