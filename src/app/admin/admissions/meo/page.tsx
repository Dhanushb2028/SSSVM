import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeoForm, MeoList } from "./meo-forms";

export default async function MeoPage() {
  const session = await requirePermissionOrRedirect("admissions.meo", "VIEW");
  const branch = session.branchId
    ? await db.branch.findUnique({ where: { id: session.branchId } })
    : await db.branch.findFirst({ where: { deletedAt: null } });
  const meos = branch ? await db.marketingOfficer.findMany({ where: { branchId: branch.id, deletedAt: null }, orderBy: { firstName: "asc" } }) : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Marketing / Enrollment Officers</h1>
        <p className="text-sm text-muted-foreground">Staff responsible for admissions outreach.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add MEO</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {branch && <MeoForm branchId={branch.id} />}
          <MeoList items={meos} />
        </CardContent>
      </Card>
    </div>
  );
}
