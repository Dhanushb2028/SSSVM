import { db } from "@/lib/db";
import { getStudentFeeDue } from "@/server/services/fees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeeProgressChart } from "@/components/shared/fee-progress-chart";
import { StatusBadge } from "@/components/ui/status-badge";

export async function StudentFeeSummary({ studentId, branchId }: { studentId: string; branchId: string }) {
  const academicYear = await db.academicYear.findFirst({ where: { branchId, isCurrent: true } });
  const summary = academicYear ? await getStudentFeeDue(studentId, academicYear.id) : null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Fee Status</CardTitle>
        {summary && (
          <StatusBadge tone={summary.balance === 0 ? "success" : "warning"}>
            {summary.balance === 0 ? "Fully paid" : `₹${summary.balance} due`}
          </StatusBadge>
        )}
      </CardHeader>
      <CardContent>
        {!summary ? (
          <p className="text-sm text-muted-foreground">No fee structure set for this student yet.</p>
        ) : (
          <FeeProgressChart totalDue={summary.totalDue} totalPaid={summary.totalPaid} balance={summary.balance} />
        )}
      </CardContent>
    </Card>
  );
}
