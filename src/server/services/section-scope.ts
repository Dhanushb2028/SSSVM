import "server-only";
import { db } from "@/lib/db";
import type { AppSession } from "@/lib/auth/session";
import { getTeacherSectionIds } from "@/lib/rbac/scope";

/** Sections the current session may act on: Admin sees their branch scope, Teacher sees only their own sections. */
export async function listActionableSections(session: AppSession) {
  if (session.role === "TEACHER") {
    const ids = await getTeacherSectionIds(session);
    return db.section.findMany({
      where: { id: { in: ids } },
      include: { course: true, branch: true },
      orderBy: { name: "asc" },
    });
  }
  return db.section.findMany({
    where: { deletedAt: null, ...(session.branchId ? { branchId: session.branchId } : {}) },
    include: { course: true, branch: true },
    orderBy: { name: "asc" },
  });
}
