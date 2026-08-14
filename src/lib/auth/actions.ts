"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { isRateLimited, recordFailedAttempt, clearAttempts } from "@/lib/auth/rate-limit";
import { loginSchema } from "@/lib/validation/auth";
import type { Role } from "@prisma/client";

export type LoginState = { error?: string };

const DESTINATION_BY_ROLE: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
  PARENT: "/parent/dashboard",
};

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const raw = {
    identifier: String(formData.get("identifier") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const identifier = parsed.data.identifier;

  if (isRateLimited(identifier, ip)) {
    return { error: "Too many failed attempts. Try again in 15 minutes." };
  }

  const user = await db.user.findFirst({
    where: { OR: [{ username: identifier }, { mobile: identifier }] },
  });

  if (!user || !user.isActive) {
    recordFailedAttempt(identifier, ip);
    return { error: "Invalid credentials." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    recordFailedAttempt(identifier, ip);
    return { error: "Invalid credentials." };
  }

  clearAttempts(identifier, ip);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id, { userAgent: hdrs.get("user-agent"), ipAddress: ip });

  redirect(DESTINATION_BY_ROLE[user.role]);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
