import "server-only";
import { db } from "@/lib/db";

export async function getThreadMessages(studentId: string) {
  const thread = await db.chatThread.findUnique({
    where: { studentId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { include: { staffMember: true, student: true, guardian: true } } },
      },
    },
  });
  return thread?.messages ?? [];
}

export function senderName(user: {
  role: string;
  name: string | null;
  username: string | null;
  staffMember: { firstName: string; lastName: string } | null;
  student: { firstName: string; lastName: string } | null;
  guardian: { firstName: string; lastName: string } | null;
}): string {
  if (user.staffMember) return `${user.staffMember.firstName} ${user.staffMember.lastName} (Staff)`;
  if (user.student) return `${user.student.firstName} ${user.student.lastName} (Student)`;
  if (user.guardian) return `${user.guardian.firstName} ${user.guardian.lastName} (Parent)`;
  return user.name ?? user.username ?? "Admin";
}

export async function listChattableStudents(scopeBranchId: string | null, sectionIds?: string[]) {
  return db.student.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      ...(sectionIds ? { sectionId: { in: sectionIds } } : { sectionId: { not: null }, ...(scopeBranchId ? { branchId: scopeBranchId } : {}) }),
    },
    orderBy: { firstName: "asc" },
    take: 500,
  });
}
