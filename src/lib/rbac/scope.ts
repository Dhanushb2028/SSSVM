import { db } from "@/lib/db";
import { ForbiddenError } from "@/lib/rbac/errors";
import type { AppSession } from "@/lib/auth/session";

// Deliberately no "server-only" guard here (unlike lib/rbac/permissions.ts) so this
// module's real DB-backed isolation logic stays directly integration-testable in
// plain Node — it's only ever called from server actions/route handlers in practice.

/**
 * Branch isolation (Section 9): an ADMIN scoped to a single branch may not act
 * on another branch's data. `branchId: null` on the session means org-wide access.
 */
export function assertBranchAccess(session: AppSession, branchId: string): void {
  if (session.role !== "ADMIN") throw new ForbiddenError();
  if (session.branchId && session.branchId !== branchId) {
    throw new ForbiddenError("You do not have access to this branch");
  }
}

/**
 * Family isolation (Section 9): a parent/student may only ever touch their own
 * linked student record(s) — verified against the database, never trusted from
 * a client-supplied ID alone.
 */
export async function assertOwnStudent(session: AppSession, studentId: string): Promise<void> {
  if (session.role === "STUDENT") {
    if (session.studentId !== studentId) throw new ForbiddenError();
    return;
  }
  if (session.role === "PARENT") {
    if (!session.guardianId) throw new ForbiddenError();
    const link = await db.studentGuardian.findUnique({
      where: { studentId_guardianId: { studentId, guardianId: session.guardianId } },
    });
    if (!link) throw new ForbiddenError();
    return;
  }
  throw new ForbiddenError();
}

/** Resolves the section IDs a TEACHER is the class teacher for (subject-level teaching assignments arrive in Phase 3). */
export async function getTeacherSectionIds(session: AppSession): Promise<string[]> {
  if (session.role !== "TEACHER" || !session.staffMemberId) return [];
  const sections = await db.section.findMany({
    where: { classTeacherId: session.staffMemberId, deletedAt: null },
    select: { id: true },
  });
  return sections.map((s) => s.id);
}
