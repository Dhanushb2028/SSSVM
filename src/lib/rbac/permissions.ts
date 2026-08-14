import "server-only";
import { redirect } from "next/navigation";
import { getSession, type AppSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/rbac/has-permission";
import { ForbiddenError, UnauthenticatedError } from "@/lib/rbac/errors";
import type { ModuleKey, PermissionActionKey } from "@/lib/rbac/modules";

export { hasPermission, ForbiddenError, UnauthenticatedError };

/** For use in Server Actions / Route Handlers: throws instead of redirecting. */
export async function requirePermission(
  moduleKey: ModuleKey,
  action: PermissionActionKey,
): Promise<AppSession> {
  const session = await getSession();
  if (!session) throw new UnauthenticatedError();
  if (!hasPermission(session, moduleKey, action)) throw new ForbiddenError();
  return session;
}

/** For use at the top of admin Server Component pages: redirects instead of throwing. */
export async function requirePermissionOrRedirect(
  moduleKey: ModuleKey,
  action: PermissionActionKey,
): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session, moduleKey, action)) redirect("/403");
  return session;
}

export async function requireRole(...roles: AppSession["role"][]): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!roles.includes(session.role)) redirect("/403");
  return session;
}

/** For Route Handlers: converts an RBAC throw into the right HTTP response, or null if it's some other error. */
export function toHttpResponse(error: unknown): Response | null {
  if (error instanceof UnauthenticatedError) return new Response("Unauthorized", { status: 401 });
  if (error instanceof ForbiddenError) return new Response("Forbidden", { status: 403 });
  return null;
}
