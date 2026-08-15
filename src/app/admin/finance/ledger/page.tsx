import Link from "next/link";
import { format } from "date-fns";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { NewReceiptDialog } from "./new-receipt-dialog";

export default async function FeeLedgerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("finance.transactions", "VIEW");
  const sp = await searchParams;
  const studentId = typeof sp.studentId === "string" ? sp.studentId : undefined;

  const [students, currentYear] = await Promise.all([
    db.student.findMany({
      where: { status: "ACTIVE", deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
      orderBy: { firstName: "asc" },
      take: 500,
    }),
    db.academicYear.findFirst({ where: { isCurrent: true, ...(session.branchId ? { branchId: session.branchId } : {}) } }),
  ]);

  const transactions = studentId
    ? await db.feeTransaction.findMany({ where: { studentId }, orderBy: { paidDate: "desc" } })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Fee Ledger</h1>
        <p className="text-sm text-muted-foreground">Full fee transaction history for one student.</p>
      </div>
      <UrlFilterSelect
        paramKey="studentId"
        placeholder="Select student"
        options={students.map((s) => ({ value: s.id, label: `${s.admissionNumber} — ${s.firstName} ${s.lastName}` }))}
        className="w-72"
      />

      {studentId && currentYear && (
        <div>
          <NewReceiptDialog studentId={studentId} academicYearId={currentYear.id} />
        </div>
      )}

      {studentId && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Receipt No.</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>
                <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Amount</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Mode</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    No transactions yet.
                  </td>
                </tr>
              )}
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    <Link href={`/admin/finance/receipts/${t.id}`} className="text-primary hover:underline">
                      {t.receiptNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{format(t.paidDate, "d MMM yyyy")}</td>
                  <td className="px-3 py-2 text-right">{t.amount}</td>
                  <td className="px-3 py-2">{t.mode}</td>
                  <td className="px-3 py-2">
                    {t.isCancelled ? <StatusBadge tone="danger">Cancelled</StatusBadge> : <StatusBadge tone="success">Paid</StatusBadge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
