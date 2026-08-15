// Pure function — no DB/server-only imports — so it stays directly unit-testable.

export type FeeDueSummary = { totalDue: number; totalPaid: number; balance: number };

/**
 * Cancelled receipts must never count toward "paid" — a cancelled fee
 * transaction represents money that was refunded/reversed, not collected.
 */
export function computeFeeDue(totalDue: number, transactions: { amount: number; isCancelled: boolean }[]): FeeDueSummary {
  const totalPaid = transactions.filter((t) => !t.isCancelled).reduce((sum, t) => sum + t.amount, 0);
  return { totalDue, totalPaid, balance: Math.max(0, totalDue - totalPaid) };
}
