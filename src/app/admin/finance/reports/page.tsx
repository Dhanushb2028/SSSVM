import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import {
  getDailyCollectionReport,
  getCashierWiseReport,
  getDailyCashbook,
  getIncomeProjection,
  getMonthlyCollectionSummary,
  getOtherFeeTypeReport,
} from "@/server/services/finance-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UrlDateInput } from "@/components/shared/url-date-input";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function FinanceReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePermissionOrRedirect("finance.reports", "VIEW");
  const sp = await searchParams;
  const branch = session.branchId
    ? await db.branch.findUnique({ where: { id: session.branchId } })
    : await db.branch.findFirst({ where: { deletedAt: null } });
  const academicYear = branch ? await db.academicYear.findFirst({ where: { branchId: branch.id, isCurrent: true } }) : null;

  const today = new Date().toISOString().slice(0, 10);
  const dcDate = typeof sp.dcDate === "string" && sp.dcDate ? sp.dcDate : today;
  const cbDate = typeof sp.cbDate === "string" && sp.cbDate ? sp.cbDate : today;
  const cwFrom = typeof sp.cwFrom === "string" && sp.cwFrom ? sp.cwFrom : today;
  const cwTo = typeof sp.cwTo === "string" && sp.cwTo ? sp.cwTo : today;
  const year = new Date().getFullYear();

  if (!branch) return <p className="text-sm text-muted-foreground">No branch exists yet.</p>;

  const [daily, cashier, cashbook, projection, monthly, otherFees] = await Promise.all([
    getDailyCollectionReport(branch.id, dcDate),
    getCashierWiseReport(branch.id, cwFrom, cwTo),
    getDailyCashbook(branch.id, cbDate),
    academicYear ? getIncomeProjection(branch.id, academicYear.id) : Promise.resolve([]),
    getMonthlyCollectionSummary(branch.id, year),
    academicYear ? getOtherFeeTypeReport(branch.id, academicYear.id) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Finance Reports</h1>
        <p className="text-sm text-muted-foreground">{branch.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Collection</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <UrlDateInput paramKey="dcDate" label="Date" fallback={today} />
          <p className="text-lg font-semibold text-foreground">₹{daily.total} <span className="text-sm font-normal text-muted-foreground">({daily.count} receipt(s))</span></p>
          <ul className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {daily.byMode.map((m) => (
              <li key={m.mode}>{m.mode}: ₹{m.amount}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cashier / Collector-wise</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <UrlDateInput paramKey="cwFrom" label="From" fallback={today} />
            <UrlDateInput paramKey="cwTo" label="To" fallback={today} />
          </div>
          {cashier.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collections in this range.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {cashier.map((c) => (
                <li key={c.collector} className="flex justify-between border-b border-border py-1 last:border-0">
                  <span>{c.collector}</span>
                  <span>{c.count} receipt(s) · ₹{c.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Cashbook</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <UrlDateInput paramKey="cbDate" label="Date" fallback={today} />
          {cashbook.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries for this date.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Entry</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">In</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Out</th>
                    <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {cashbook.entries.map((e, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">{e.label}</td>
                      <td className="px-3 py-2 text-right">{e.inflow || ""}</td>
                      <td className="px-3 py-2 text-right">{e.outflow || ""}</td>
                      <td className="px-3 py-2 text-right font-medium">{e.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-sm font-medium text-foreground">Closing balance: ₹{cashbook.closingBalance}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income Projection ({academicYear?.name ?? "no current year"})</CardTitle>
        </CardHeader>
        <CardContent>
          {projection.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fee structure defined yet.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {projection.map((p) => (
                <li key={p.course} className="flex justify-between border-b border-border py-1 last:border-0">
                  <span>{p.course} ({p.studentCount} students)</span>
                  <span>Projected ₹{p.projectedIncome} · Collected ₹{p.collected}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Collection Summary ({year})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-3 text-sm">
            {monthly.map((m) => (
              <li key={m.month}>{MONTH_NAMES[m.month - 1]}: ₹{m.amount}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Fee Type Report ({academicYear?.name ?? "no current year"})</CardTitle>
        </CardHeader>
        <CardContent>
          {otherFees.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fee structure defined yet.</p>
          ) : (
            <ul className="flex flex-wrap gap-3 text-sm">
              {otherFees.map((f) => (
                <li key={f.category}>{f.category}: ₹{f.amount}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
