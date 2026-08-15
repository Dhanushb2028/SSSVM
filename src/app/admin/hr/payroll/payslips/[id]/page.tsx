import { notFound } from "next/navigation";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { db } from "@/lib/db";
import { PrintButton } from "@/app/admin/sis/id-cards/print/print-button";
import type { PayslipBreakdownLine } from "@/server/services/payroll";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default async function PayslipPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermissionOrRedirect("hr.payroll", "VIEW");
  const { id } = await params;
  const payslip = await db.payslip.findUnique({ where: { id }, include: { staffMember: { include: { branch: true } } } });
  if (!payslip) notFound();
  assertBranchAccess(session, payslip.branchId);

  const breakdown = payslip.breakdown as unknown as PayslipBreakdownLine[];

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="no-print flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Payslip</h1>
      </div>
      <PrintButton />

      <div className="rounded-lg border-2 border-primary p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sree Siva Shankar Vidya Mandir</p>
        <p className="text-xs text-muted-foreground">{payslip.staffMember.branch.name}</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{MONTHS[payslip.month - 1]} {payslip.year}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
          <p className="text-muted-foreground">Employee</p>
          <p className="text-right text-foreground">{payslip.staffMember.firstName} {payslip.staffMember.lastName}</p>
          <p className="text-muted-foreground">Employee Code</p>
          <p className="text-right text-foreground">{payslip.staffMember.employeeCode}</p>
          <p className="text-muted-foreground">Designation</p>
          <p className="text-right text-foreground">{payslip.staffMember.designation}</p>
        </div>

        <div className="mt-3 border-t border-border pt-2">
          {breakdown.map((line) => (
            <div key={line.name} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {line.name} {line.type === "DEDUCTION" ? "(deduction)" : ""}
              </span>
              <span className="text-foreground">{line.type === "DEDUCTION" ? "−" : ""}₹{line.amount}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between border-t-2 border-foreground pt-2 text-base font-semibold text-foreground">
          <span>Net Pay</span>
          <span>₹{payslip.netPay}</span>
        </div>
      </div>
    </div>
  );
}
