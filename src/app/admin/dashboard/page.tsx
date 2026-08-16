import { Building2, Landmark, Users, GraduationCap, LayoutGrid } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCourseAbstract } from "@/server/services/sis-reports";
import { EnrollmentChart } from "./enrollment-chart";

export default async function AdminDashboardPage() {
  const session = await getSession();

  const branchFilter = session?.branchId ? { branchId: session.branchId } : {};

  const [organizationCount, branchCount, currentYear, userCount, studentCount, sectionCount, abstract_] = await Promise.all([
    db.organization.count({ where: { deletedAt: null } }),
    db.branch.count({ where: { deletedAt: null, ...(session?.branchId ? { id: session.branchId } : {}) } }),
    db.academicYear.findFirst({ where: { isCurrent: true, ...branchFilter }, include: { branch: true } }),
    db.user.count({ where: { isActive: true, ...(session?.branchId ? { branchId: session.branchId } : {}) } }),
    db.student.count({ where: { deletedAt: null, status: "ACTIVE", ...branchFilter } }),
    db.section.count({ where: { deletedAt: null, ...branchFilter } }),
    getCourseAbstract(session?.branchId ?? null),
  ]);

  const tiles = [
    { label: "Active Students", value: studentCount, icon: GraduationCap },
    { label: "Sections", value: sectionCount, icon: LayoutGrid },
    { label: "Organizations", value: organizationCount, icon: Landmark },
    { label: "Branches", value: branchCount, icon: Building2 },
    { label: "Active Users", value: userCount, icon: Users },
  ];

  const chartData = new Map<string, number>();
  for (const row of abstract_) {
    chartData.set(row.course, (chartData.get(row.course) ?? 0) + row.strength);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Welcome, {session?.displayName}</h1>
        <p className="text-sm text-muted-foreground">
          {currentYear ? `Current academic year: ${currentYear.name} (${currentYear.branch.name})` : "No current academic year set yet."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

      {chartData.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enrollment by course</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentChart data={Array.from(chartData.entries()).map(([course, students]) => ({ course, students }))} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
