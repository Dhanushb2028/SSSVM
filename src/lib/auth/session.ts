import "server-only";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

const COOKIE_NAME = "sssvm_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type AppSession = {
  sessionId: string;
  userId: string;
  role: Role;
  username: string | null;
  mobile: string | null;
  branchId: string | null;
  studentId: string | null;
  guardianId: string | null;
  staffMemberId: string | null;
  displayName: string;
  isSuperAdmin: boolean;
  permissionGrants: { module: string; action: string }[];
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  meta: { userAgent?: string | null; ipAddress?: string | null },
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: meta.userAgent ?? undefined,
      ipAddress: meta.ipAddress ?? undefined,
    },
  });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

function displayNameFor(user: {
  name: string | null;
  username: string | null;
  staffMember: { firstName: string; lastName: string } | null;
  student: { firstName: string; lastName: string } | null;
  guardian: { firstName: string; lastName: string } | null;
}): string {
  if (user.staffMember) return `${user.staffMember.firstName} ${user.staffMember.lastName}`;
  if (user.student) return `${user.student.firstName} ${user.student.lastName}`;
  if (user.guardian) return `${user.guardian.firstName} ${user.guardian.lastName}`;
  return user.name ?? user.username ?? "Admin";
}

export async function getSession(): Promise<AppSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          staffMember: true,
          student: true,
          guardian: true,
          permissionProfile: { include: { grants: true } },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    return null;
  }

  const { user } = session;

  return {
    sessionId: session.id,
    userId: user.id,
    role: user.role,
    username: user.username,
    mobile: user.mobile,
    branchId: user.branchId,
    studentId: user.studentId,
    guardianId: user.guardianId,
    staffMemberId: user.staffMemberId,
    displayName: displayNameFor(user),
    isSuperAdmin: user.role === "ADMIN" && user.permissionProfileId === null,
    permissionGrants:
      user.permissionProfile?.grants.map((g) => ({ module: g.module, action: g.action })) ?? [],
  };
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await db.session.deleteMany({ where: { tokenHash } });
  }
  store.delete(COOKIE_NAME);
}

/** Force-logout everywhere: used when an admin deactivates a user's account. */
export async function destroyAllSessionsForUser(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}
