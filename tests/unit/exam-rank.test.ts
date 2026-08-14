import { describe, it, expect } from "vitest";
import { computeRanks } from "@/server/services/exam-rank";

describe("computeRanks", () => {
  it("ranks distinct scores in descending order", () => {
    const result = computeRanks([
      { studentId: "a", totalMarks: 70 },
      { studentId: "b", totalMarks: 90 },
      { studentId: "c", totalMarks: 80 },
    ]);
    expect(result.map((r) => [r.studentId, r.rank])).toEqual([
      ["b", 1],
      ["c", 2],
      ["a", 3],
    ]);
  });

  it("gives tied scores the same rank and skips the next rank accordingly (1224 ranking)", () => {
    const result = computeRanks([
      { studentId: "a", totalMarks: 90 },
      { studentId: "b", totalMarks: 80 },
      { studentId: "c", totalMarks: 80 },
      { studentId: "d", totalMarks: 70 },
    ]);
    expect(result.map((r) => r.rank)).toEqual([1, 2, 2, 4]);
  });

  it("gives every student rank 1 when all scores tie", () => {
    const result = computeRanks([
      { studentId: "a", totalMarks: 50 },
      { studentId: "b", totalMarks: 50 },
    ]);
    expect(result.map((r) => r.rank)).toEqual([1, 1]);
  });

  it("handles an empty list", () => {
    expect(computeRanks([])).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const input = [
      { studentId: "a", totalMarks: 10 },
      { studentId: "b", totalMarks: 20 },
    ];
    const inputCopy = [...input];
    computeRanks(input);
    expect(input).toEqual(inputCopy);
  });
});
