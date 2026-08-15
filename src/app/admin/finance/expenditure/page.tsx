import { format } from "date-fns";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseFormDialog } from "./expense-form-dialog";
import { CancelExpenseDialog } from "./cancel-expense-dialog";

export default async function ExpenditurePage() {
  const session = await requirePermissionOrRedirect("finance.expenditure", "VIEW");
  const branch = session.branchId
    ? await db.branch.findUnique({ where: { id: session.branchId } })
    : await db.branch.findFirst({ where: { deletedAt: null } });

  const expenses = branch
    ? await db.expense.findMany({ where: { branchId: branch.id }, orderBy: { date: "desc" }, take: 200 })
    : [];
  const active = expenses.filter((e) => !e.isCancelled);
  const cancelled = expenses.filter((e) => e.isCancelled);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Expenditure</h1>
          <p className="text-sm text-muted-foreground">{branch?.name}</p>
        </div>
        {branch && <ExpenseFormDialog branchId={branch.id} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {active.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
                  <div>
                    <p className="text-foreground">{e.description} {e.category && <span className="text-muted-foreground">({e.category})</span>}</p>
                    <p className="text-muted-foreground">{format(e.date, "d MMM yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">₹{e.amount}</span>
                    <CancelExpenseDialog id={e.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cancelled Expenses ({cancelled.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cancelled.length === 0 ? (
            <p className="text-sm text-muted-foreground">None.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {cancelled.map((e) => (
                <li key={e.id} className="rounded-md border border-border p-2 text-sm text-muted-foreground">
                  {e.description} — ₹{e.amount} — {format(e.date, "d MMM yyyy")}
                  {e.cancelledReason && <span> · Reason: {e.cancelledReason}</span>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
