import { Download } from "lucide-react";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { getFeeDueReport } from "@/server/services/fees";
import { Button } from "@/components/ui/button";
import { FeeDueSmsButton } from "./fee-due-sms-button";

export default async function FeeDuePage() {
  const session = await requirePermissionOrRedirect("finance.reports", "VIEW");
  const branch = session.branchId
    ? await db.branch.findUnique({ where: { id: session.branchId } })
    : await db.branch.findFirst({ where: { deletedAt: null } });
  const academicYear = branch
    ? await db.academicYear.findFirst({ where: { branchId: branch.id, isCurrent: true } })
    : null;

  const rows = branch && academicYear ? await getFeeDueReport(branch.id, academicYear.id) : [];
  const withBalance = rows.filter((r) => r.balance > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Fee Due Report</h1>
          <p className="text-sm text-muted-foreground">
            {branch?.name} · {academicYear?.name ?? "No current academic year"}
          </p>
        </div>
        <div className="flex gap-2">
          {branch && academicYear && (
            <>
              <Button asChild variant="secondary" size="sm">
                <a href={`/admin/finance/fee-due/export?branchId=${branch.id}&academicYearId=${academicYear.id}`}>
                  <Download aria-hidden="true" />
                  Export CSV
                </a>
              </Button>
              <FeeDueSmsButton branchId={branch.id} academicYearId={academicYear.id} count={withBalance.length} />
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Admission No.</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Total Due</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Paid</th>
              <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  No fee structure defined for this branch/year yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.student.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">{r.student.admissionNumber}</td>
                <td className="px-3 py-2">{r.student.firstName} {r.student.lastName}</td>
                <td className="px-3 py-2 text-right">{r.totalDue}</td>
                <td className="px-3 py-2 text-right">{r.totalPaid}</td>
                <td className={`px-3 py-2 text-right font-medium ${r.balance > 0 ? "text-danger" : "text-success"}`}>{r.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
