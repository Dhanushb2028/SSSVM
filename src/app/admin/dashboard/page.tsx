import { Building2, Landmark, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await getSession();

  const branchFilter = session?.branchId ? { branchId: session.branchId } : {};

  const [organizationCount, branchCount, currentYear, userCount] = await Promise.all([
    db.organization.count({ where: { deletedAt: null } }),
    db.branch.count({ where: { deletedAt: null, ...(session?.branchId ? { id: session.branchId } : {}) } }),
    db.academicYear.findFirst({ where: { isCurrent: true, ...branchFilter }, include: { branch: true } }),
    db.user.count({ where: { isActive: true, ...(session?.branchId ? { branchId: session.branchId } : {}) } }),
  ]);

  const tiles = [
    { label: "Organizations", value: organizationCount, icon: Landmark },
    { label: "Branches", value: branchCount, icon: Building2 },
    { label: "Active Users", value: userCount, icon: Users },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Welcome, {session?.displayName}</h1>
        <p className="text-sm text-muted-foreground">
          {currentYear ? `Current academic year: ${currentYear.name} (${currentYear.branch.name})` : "No current academic year set yet."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{tile.label}</CardTitle>
              <tile.icon aria-hidden="true" className="size-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{tile.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>This is Phase 1 of the SSSVM system: System Setup and Users &amp; Roles are live.</p>
          <p>
            Student records, attendance, exams, finance, admissions, and the rest of the module set roll out in the
            phases that follow — see ARCHITECTURE.md for the build order.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
