import Link from "next/link";

type Payslip = {
  id: string;
  month: number;
  year: number;
  netPay: number;
  staffMember: { firstName: string; lastName: string; employeeCode: string };
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function PayslipsList({ payslips }: { payslips: Payslip[] }) {
  if (payslips.length === 0) {
    return <p className="text-sm text-muted-foreground">No payslips generated yet.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-background">
            <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Staff</th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Period</th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-muted-foreground">Net Pay</th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {payslips.map((p) => (
            <tr key={p.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2">
                {p.staffMember.firstName} {p.staffMember.lastName} <span className="text-muted-foreground">({p.staffMember.employeeCode})</span>
              </td>
              <td className="px-3 py-2">{MONTHS[p.month - 1]} {p.year}</td>
              <td className="px-3 py-2 text-right">₹{p.netPay}</td>
              <td className="px-3 py-2">
                <Link href={`/admin/hr/payroll/payslips/${p.id}`} className="text-sm font-medium text-primary underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
