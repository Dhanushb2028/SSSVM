import { db } from "@/lib/db";
import { ForbiddenError, UnauthenticatedError } from "@/lib/rbac/errors";
import { hasPermission } from "@/lib/rbac/has-permission";
import type { AppSession } from "@/lib/auth/session";
import type { ModuleKey } from "@/lib/rbac/modules";

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

/**
 * Resolves the section IDs a TEACHER is the class teacher for. There is no
 * separate per-subject teaching-assignment model yet, so "is this teacher's
 * section" is the class-teacher relationship (documented decision — see README).
 */
export async function getTeacherSectionIds(session: AppSession): Promise<string[]> {
  if (session.role !== "TEACHER" || !session.staffMemberId) return [];
  const sections = await db.section.findMany({
    where: { classTeacherId: session.staffMemberId, deletedAt: null },
    select: { id: true },
  });
  return sections.map((s) => s.id);
}

/**
 * Shared authorization for the screens both Admin and Teacher can act on
 * (attendance, timetable, and later homework/marks-entry): an ADMIN needs the
 * usual module grant + branch scope; a TEACHER may only act on a section
 * they're the class teacher for. `requirePermission` alone can't express this
 * because it only ever passes for ADMIN sessions (Section 4: Teacher access
 * is row-scoped, not module-permission-scoped).
 */
export async function requireSectionActionAccess(
  session: AppSession | null,
  sectionId: string,
  moduleKey: ModuleKey,
): Promise<void> {
  if (!session) throw new UnauthenticatedError();

  const section = await db.section.findUnique({ where: { id: sectionId }, select: { branchId: true, classTeacherId: true } });
  if (!section) throw new ForbiddenError("Section not found");

  if (session.role === "ADMIN") {
    if (!hasPermission(session, moduleKey, "EDIT") && !hasPermission(session, moduleKey, "CREATE")) {
      throw new ForbiddenError();
    }
    assertBranchAccess(session, section.branchId);
    return;
  }

  if (session.role === "TEACHER") {
    if (!session.staffMemberId || section.classTeacherId !== session.staffMemberId) {
      throw new ForbiddenError("Not your section");
    }
    return;
  }

  throw new ForbiddenError();
}

/**
 * Like requireSectionActionAccess, but for branch-wide screens with no
 * per-section ownership to check (e.g. the school calendar): any TEACHER at
 * the branch may act, not just class teachers of a specific section.
 */
export async function requireBranchActionAccess(
  session: AppSession | null,
  branchId: string,
  moduleKey: ModuleKey,
): Promise<void> {
  if (!session) throw new UnauthenticatedError();

  if (session.role === "ADMIN") {
    if (!hasPermission(session, moduleKey, "EDIT") && !hasPermission(session, moduleKey, "CREATE")) {
      throw new ForbiddenError();
    }
    assertBranchAccess(session, branchId);
    return;
  }

  if (session.role === "TEACHER") {
    if (!session.staffMemberId) throw new ForbiddenError();
    const staff = await db.staffMember.findUnique({ where: { id: session.staffMemberId }, select: { branchId: true } });
    if (!staff || staff.branchId !== branchId) throw new ForbiddenError("Not your branch");
    return;
  }

  throw new ForbiddenError();
}
