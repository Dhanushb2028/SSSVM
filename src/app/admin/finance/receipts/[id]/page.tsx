import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requirePermissionOrRedirect, hasPermission } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/status-badge";
import { PrintButton } from "@/app/admin/sis/id-cards/print/print-button";
import { CancelReceiptDialog } from "./cancel-receipt-dialog";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermissionOrRedirect("finance.transactions", "VIEW");
  const { id } = await params;
  const transaction = await db.feeTransaction.findUnique({
    where: { id },
    include: { student: { include: { branch: true, section: { include: { course: true } } } }, academicYear: true },
  });
  if (!transaction) notFound();
  assertBranchAccess(session, transaction.branchId);

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="no-print flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Fee Receipt</h1>
        {!transaction.isCancelled && hasPermission(session, "finance.transactions", "DELETE") && (
          <CancelReceiptDialog id={transaction.id} receiptNumber={transaction.receiptNumber} />
        )}
      </div>
      <PrintButton />

      <div className="rounded-lg border-2 border-primary p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sree Siva Shankar Vidya Mandir</p>
        <p className="text-xs text-muted-foreground">{transaction.student.branch.name}</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Receipt No. {transaction.receiptNumber}</p>
          {transaction.isCancelled ? <StatusBadge tone="danger">Cancelled</StatusBadge> : <StatusBadge tone="success">Paid</StatusBadge>}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
          <p className="text-muted-foreground">Student</p>
          <p className="text-right text-foreground">{transaction.student.firstName} {transaction.student.lastName}</p>
          <p className="text-muted-foreground">Admission No.</p>
          <p className="text-right text-foreground">{transaction.student.admissionNumber}</p>
          <p className="text-muted-foreground">Section</p>
          <p className="text-right text-foreground">
            {transaction.student.section ? `${transaction.student.section.course.name} - ${transaction.student.section.name}` : "—"}
          </p>
          <p className="text-muted-foreground">Academic Year</p>
          <p className="text-right text-foreground">{transaction.academicYear.name}</p>
          <p className="text-muted-foreground">Date</p>
          <p className="text-right text-foreground">{format(transaction.paidDate, "d MMM yyyy")}</p>
          <p className="text-muted-foreground">Mode</p>
          <p className="text-right text-foreground">{transaction.mode}</p>
          {transaction.remarks && (
            <>
              <p className="text-muted-foreground">Remarks</p>
              <p className="text-right text-foreground">{transaction.remarks}</p>
            </>
          )}
        </div>
        <div className="mt-3 flex justify-between border-t-2 border-foreground pt-2 text-base font-semibold text-foreground">
          <span>Amount</span>
          <span>₹{transaction.amount}</span>
        </div>
        {transaction.isCancelled && transaction.cancelledReason && (
          <p className="mt-3 text-xs text-danger">Cancelled: {transaction.cancelledReason}</p>
        )}
      </div>
    </div>
  );
}
