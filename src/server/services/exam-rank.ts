// Pure function — no DB/server-only imports — so it stays directly unit-testable.

export type RankableEntry = { studentId: string; totalMarks: number };
export type RankedEntry = RankableEntry & { rank: number };

/**
 * Standard competition ranking ("1224" ranking): tied students share the same
 * rank, and the next distinct score skips ahead by the number of ties (e.g.
 * scores 90, 80, 80, 70 rank 1, 2, 2, 4 — not 1, 2, 2, 3).
 */
export function computeRanks(entries: RankableEntry[]): RankedEntry[] {
  const sorted = [...entries].sort((a, b) => b.totalMarks - a.totalMarks);

  let rank = 0;
  let previousMarks: number | null = null;
  let position = 0;

  return sorted.map((entry) => {
    position += 1;
    if (entry.totalMarks !== previousMarks) {
      rank = position;
      previousMarks = entry.totalMarks;
    }
    return { ...entry, rank };
  });
}
