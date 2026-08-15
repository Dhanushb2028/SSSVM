import { format } from "date-fns";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { BankTransactionFormDialog } from "./bank-transaction-form-dialog";
import { CancelBankTransactionDialog } from "./cancel-bank-transaction-dialog";

const TONE: Record<string, "success" | "warning" | "neutral"> = {
  DEPOSIT: "success",
  RECEIVE: "success",
  WITHDRAWAL: "warning",
  PAY: "warning",
  LOAN: "neutral",
};

export default async function BankingPage() {
  const session = await requirePermissionOrRedirect("finance.banking", "VIEW");
  const branch = session.branchId
    ? await db.branch.findUnique({ where: { id: session.branchId } })
    : await db.branch.findFirst({ where: { deletedAt: null } });

  const transactions = branch
    ? await db.bankTransaction.findMany({ where: { branchId: branch.id }, orderBy: { date: "desc" }, take: 200 })
    : [];
  const active = transactions.filter((t) => !t.isCancelled);
  const cancelled = transactions.filter((t) => t.isCancelled);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Banking</h1>
          <p className="text-sm text-muted-foreground">{branch?.name}</p>
        </div>
        {branch && <BankTransactionFormDialog branchId={branch.id} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {active.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <StatusBadge tone={TONE[t.type]}>{t.type}</StatusBadge>
                    <div>
                      <p className="text-foreground">{t.description || "—"}</p>
                      <p className="text-muted-foreground">{format(t.date, "d MMM yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">₹{t.amount}</span>
                    <CancelBankTransactionDialog id={t.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cancelled ({cancelled.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cancelled.length === 0 ? (
            <p className="text-sm text-muted-foreground">None.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {cancelled.map((t) => (
                <li key={t.id} className="rounded-md border border-border p-2 text-sm text-muted-foreground">
                  {t.type} — ₹{t.amount} — {format(t.date, "d MMM yyyy")}
                  {t.cancelledReason && <span> · Reason: {t.cancelledReason}</span>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
