import "server-only";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { AppSession } from "@/lib/auth/session";

export type OwnProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneEditable: boolean;
};

/** Every account type sources its editable contact fields from a different underlying record (Section 5). */
export async function getOwnProfile(session: AppSession): Promise<OwnProfile> {
  if (session.staffMemberId) {
    const staff = await db.staffMember.findUniqueOrThrow({ where: { id: session.staffMemberId } });
    return {
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email ?? "",
      phone: staff.phone,
      phoneEditable: true,
    };
  }
  if (session.studentId) {
    const student = await db.student.findUniqueOrThrow({ where: { id: session.studentId } });
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.contactEmail ?? "",
      phone: student.contactPhone ?? "",
      phoneEditable: true,
    };
  }
  if (session.guardianId) {
    const guardian = await db.guardian.findUniqueOrThrow({ where: { id: session.guardianId } });
    return {
      firstName: guardian.firstName,
      lastName: guardian.lastName,
      email: guardian.email ?? "",
      phone: guardian.phone,
      // Guardian phone is also the login identifier — changed by an admin only, not self-service.
      phoneEditable: false,
    };
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: session.userId } });
  const [firstName, ...rest] = (user.name ?? "").split(" ");
  return {
    firstName: firstName ?? "",
    lastName: rest.join(" "),
    email: user.email ?? "",
    phone: "",
    phoneEditable: false,
  };
}

export async function updateOwnProfile(
  session: AppSession,
  data: { firstName: string; lastName: string; email: string; phone: string },
): Promise<void> {
  if (session.staffMemberId) {
    await db.staffMember.update({
      where: { id: session.staffMemberId },
      data: { firstName: data.firstName, lastName: data.lastName, email: data.email || null, phone: data.phone },
    });
    return;
  }
  if (session.studentId) {
    await db.student.update({
      where: { id: session.studentId },
      data: { contactEmail: data.email || null, contactPhone: data.phone || null },
    });
    return;
  }
  if (session.guardianId) {
    await db.guardian.update({
      where: { id: session.guardianId },
      data: { firstName: data.firstName, lastName: data.lastName, email: data.email || null },
    });
    return;
  }
  await db.user.update({
    where: { id: session.userId },
    data: { name: `${data.firstName} ${data.lastName}`.trim(), email: data.email || null },
  });
}

export async function changeOwnPassword(
  session: AppSession,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await db.user.findUniqueOrThrow({ where: { id: session.userId } });
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { ok: false, error: "Current password is incorrect." };

  const passwordHash = await hashPassword(newPassword);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });
  return { ok: true };
}
