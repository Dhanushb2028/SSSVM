import "server-only";
import { db } from "@/lib/db";

export async function getDailyCollectionReport(branchId: string, date: string) {
  const transactions = await db.feeTransaction.findMany({
    where: { branchId, paidDate: new Date(date), isCancelled: false },
  });
  const byMode = new Map<string, number>();
  for (const t of transactions) byMode.set(t.mode, (byMode.get(t.mode) ?? 0) + t.amount);
  return {
    total: transactions.reduce((sum, t) => sum + t.amount, 0),
    count: transactions.length,
    byMode: Array.from(byMode.entries()).map(([mode, amount]) => ({ mode, amount })),
  };
}

export async function getCashierWiseReport(branchId: string, dateFrom: string, dateTo: string) {
  const transactions = await db.feeTransaction.findMany({
    where: { branchId, paidDate: { gte: new Date(dateFrom), lte: new Date(dateTo) }, isCancelled: false },
    include: { student: false },
  });
  const collectorIds = [...new Set(transactions.map((t) => t.collectedByUserId).filter((id): id is string => Boolean(id)))];
  const users = await db.user.findMany({ where: { id: { in: collectorIds } }, include: { staffMember: true } });
  const nameById = new Map(users.map((u) => [u.id, u.staffMember ? `${u.staffMember.firstName} ${u.staffMember.lastName}` : u.name ?? u.username ?? "Admin"]));

  const byCollector = new Map<string, { count: number; amount: number }>();
  for (const t of transactions) {
    const key = t.collectedByUserId ?? "unknown";
    const existing = byCollector.get(key) ?? { count: 0, amount: 0 };
    existing.count += 1;
    existing.amount += t.amount;
    byCollector.set(key, existing);
  }
  return Array.from(byCollector.entries()).map(([userId, stats]) => ({
    collector: nameById.get(userId) ?? "Unknown",
    ...stats,
  }));
}

export async function getDailyCashbook(branchId: string, date: string) {
  const d = new Date(date);
  const [collections, expenses, bankTx] = await Promise.all([
    db.feeTransaction.findMany({ where: { branchId, paidDate: d, isCancelled: false }, include: { student: true } }),
    db.expense.findMany({ where: { branchId, date: d, isCancelled: false } }),
    db.bankTransaction.findMany({ where: { branchId, date: d, isCancelled: false } }),
  ]);

  const entries = [
    ...collections.map((c) => ({ label: `Fee receipt ${c.receiptNumber} — ${c.student.firstName} ${c.student.lastName}`, inflow: c.amount, outflow: 0 })),
    ...bankTx
      .filter((b) => b.type === "DEPOSIT" || b.type === "RECEIVE")
      .map((b) => ({ label: `${b.type}${b.description ? ` — ${b.description}` : ""}`, inflow: b.amount, outflow: 0 })),
    ...expenses.map((e) => ({ label: `Expense — ${e.description}`, inflow: 0, outflow: e.amount })),
    ...bankTx
      .filter((b) => b.type === "WITHDRAWAL" || b.type === "PAY" || b.type === "LOAN")
      .map((b) => ({ label: `${b.type}${b.description ? ` — ${b.description}` : ""}`, inflow: 0, outflow: b.amount })),
  ];

  let running = 0;
  const withRunning = entries.map((e) => {
    running += e.inflow - e.outflow;
    return { ...e, balance: running };
  });

  return { entries: withRunning, closingBalance: running };
}

export async function getIncomeProjection(branchId: string, academicYearId: string) {
  const courses = await db.course.findMany({ where: { deletedAt: null }, orderBy: { orderIndex: "asc" } });
  const structures = await db.feeStructure.findMany({ where: { branchId, academicYearId } });
  const structureByCourseId = new Map<string, number>();
  for (const s of structures) structureByCourseId.set(s.courseId, (structureByCourseId.get(s.courseId) ?? 0) + s.amount);

  const results = [];
  for (const course of courses) {
    const perStudentDue = structureByCourseId.get(course.id) ?? 0;
    if (perStudentDue === 0) continue;
    const studentCount = await db.student.count({
      where: { branchId, status: "ACTIVE", deletedAt: null, section: { courseId: course.id } },
    });
    const collected = await db.feeTransaction.aggregate({
      where: { branchId, academicYearId, isCancelled: false, student: { section: { courseId: course.id } } },
      _sum: { amount: true },
    });
    results.push({
      course: course.name,
      studentCount,
      projectedIncome: perStudentDue * studentCount,
      collected: collected._sum.amount ?? 0,
    });
  }
  return results;
}

export async function getMonthlyCollectionSummary(branchId: string, year: number) {
  const transactions = await db.feeTransaction.findMany({
    where: { branchId, isCancelled: false, paidDate: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } },
  });
  const byMonth = new Array(12).fill(0);
  for (const t of transactions) byMonth[t.paidDate.getUTCMonth()] += t.amount;
  return byMonth.map((amount, i) => ({ month: i + 1, amount }));
}

export async function getOtherFeeTypeReport(branchId: string, academicYearId: string) {
  const structures = await db.feeStructure.findMany({
    where: { branchId, academicYearId },
    include: { feeComponent: true },
  });
  const byCategory = new Map<string, number>();
  for (const s of structures) byCategory.set(s.feeComponent.category, (byCategory.get(s.feeComponent.category) ?? 0) + s.amount);
  return Array.from(byCategory.entries()).map(([category, amount]) => ({ category, amount }));
}
