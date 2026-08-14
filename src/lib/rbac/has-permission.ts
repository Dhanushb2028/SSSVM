import type { Role } from "@prisma/client";
import type { ModuleKey, PermissionActionKey } from "@/lib/rbac/modules";

// Deliberately has no "server-only" or "next/*" imports so it stays unit-testable
// in plain Node, and so permissions.ts can build its server-only wrappers on top of it.
export type PermissionCheckSession = {
  role: Role;
  isSuperAdmin: boolean;
  permissionGrants: { module: string; action: string }[];
} | null;

/**
 * Server-side permission check — the actual security boundary (Section 9).
 * ADMIN with no PermissionProfile (super admin) always passes. An ADMIN scoped
 * to a PermissionProfile must have an explicit grant for (module, action).
 * TEACHER/STUDENT/PARENT never pass module checks — their access is
 * row-scoped (own sections/own student/own family), see lib/rbac/scope.ts.
 */
export function hasPermission(
  session: PermissionCheckSession,
  moduleKey: ModuleKey,
  action: PermissionActionKey,
): boolean {
  if (!session) return false;
  if (session.role !== "ADMIN") return false;
  if (session.isSuperAdmin) return true;
  return session.permissionGrants.some((g) => g.module === moduleKey && g.action === action);
}
