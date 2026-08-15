import "server-only";
import { db } from "@/lib/db";

export type PayslipBreakdownLine = { name: string; type: "EARNING" | "DEDUCTION"; amount: number };

/**
 * Snapshots the staff member's current salary structure into a Payslip row
 * (like a fee receipt) so later salary-structure edits never rewrite payroll
 * history. Re-generating for the same staff/month/year overwrites the snapshot.
 */
export async function generatePayslipForStaff(
  staffMemberId: string,
  branchId: string,
  month: number,
  year: number,
  generatedById: string | null,
) {
  const structure = await db.staffSalaryComponent.findMany({
    where: { staffMemberId },
    include: { salaryComponent: true },
  });
  if (structure.length === 0) return null;

  const breakdown: PayslipBreakdownLine[] = structure.map((s) => ({
    name: s.salaryComponent.name,
    type: s.salaryComponent.type,
    amount: s.amount,
  }));
  const grossEarnings = breakdown.filter((b) => b.type === "EARNING").reduce((sum, b) => sum + b.amount, 0);
  const totalDeductions = breakdown.filter((b) => b.type === "DEDUCTION").reduce((sum, b) => sum + b.amount, 0);
  const netPay = grossEarnings - totalDeductions;

  return db.payslip.upsert({
    where: { staffMemberId_month_year: { staffMemberId, month, year } },
    create: { staffMemberId, branchId, month, year, breakdown, grossEarnings, totalDeductions, netPay, generatedById },
    update: { breakdown, grossEarnings, totalDeductions, netPay, generatedById },
  });
}

export async function generatePayslipsForBranch(branchId: string, month: number, year: number, generatedById: string | null) {
  const staff = await db.staffMember.findMany({ where: { branchId, status: "ACTIVE", deletedAt: null } });
  let generated = 0;
  let skipped = 0;
  for (const s of staff) {
    const result = await generatePayslipForStaff(s.id, branchId, month, year, generatedById);
    if (result) generated += 1;
    else skipped += 1;
  }
  return { generated, skipped, total: staff.length };
}

export async function listPayslips(branchId: string | null, month?: number, year?: number) {
  return db.payslip.findMany({
    where: {
      ...(branchId ? { branchId } : {}),
      ...(month ? { month } : {}),
      ...(year ? { year } : {}),
    },
    orderBy: [{ year: "desc" }, { month: "desc" }, { staffMember: { firstName: "asc" } }],
    include: { staffMember: true },
  });
}
