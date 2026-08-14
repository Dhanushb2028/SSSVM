import "server-only";
import { db } from "@/lib/db";

export async function getSectionStrength(scopeBranchId: string | null) {
  const sections = await db.section.findMany({
    where: { deletedAt: null, ...(scopeBranchId ? { branchId: scopeBranchId } : {}) },
    include: { branch: true, course: true, _count: { select: { students: { where: { deletedAt: null, status: "ACTIVE" } } } } },
    orderBy: [{ branch: { name: "asc" } }, { course: { orderIndex: "asc" } }, { name: "asc" }],
  });
  return sections.map((s) => ({
    branch: s.branch.name,
    course: s.course.name,
    section: s.name,
    capacity: s.capacity,
    strength: s._count.students,
  }));
}

export async function getCourseAbstract(scopeBranchId: string | null) {
  const sections = await db.section.findMany({
    where: { deletedAt: null, ...(scopeBranchId ? { branchId: scopeBranchId } : {}) },
    include: { branch: true, course: true, _count: { select: { students: { where: { deletedAt: null, status: "ACTIVE" } } } } },
  });

  const map = new Map<string, { branch: string; course: string; sectionCount: number; strength: number }>();
  for (const s of sections) {
    const key = `${s.branch.name}::${s.course.name}`;
    const existing = map.get(key) ?? { branch: s.branch.name, course: s.course.name, sectionCount: 0, strength: 0 };
    existing.sectionCount += 1;
    existing.strength += s._count.students;
    map.set(key, existing);
  }
  return Array.from(map.values()).sort((a, b) => a.branch.localeCompare(b.branch) || a.course.localeCompare(b.course));
}
