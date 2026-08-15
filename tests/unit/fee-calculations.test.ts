import { describe, it, expect } from "vitest";
import { computeFeeDue } from "@/server/services/fee-calculations";

describe("computeFeeDue", () => {
  it("computes balance as due minus paid", () => {
    const result = computeFeeDue(10000, [{ amount: 4000, isCancelled: false }]);
    expect(result).toEqual({ totalDue: 10000, totalPaid: 4000, balance: 6000 });
  });

  it("excludes cancelled receipts from totalPaid", () => {
    const result = computeFeeDue(10000, [
      { amount: 4000, isCancelled: false },
      { amount: 3000, isCancelled: true },
    ]);
    expect(result.totalPaid).toBe(4000);
    expect(result.balance).toBe(6000);
  });

  it("never returns a negative balance when overpaid", () => {
    const result = computeFeeDue(5000, [{ amount: 7000, isCancelled: false }]);
    expect(result.balance).toBe(0);
  });

  it("returns the full amount due when nothing has been paid", () => {
    const result = computeFeeDue(5000, []);
    expect(result).toEqual({ totalDue: 5000, totalPaid: 0, balance: 5000 });
  });
});
