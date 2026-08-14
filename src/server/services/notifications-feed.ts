import "server-only";
import { db } from "@/lib/db";

/** Notifications visible to a given student: school-wide, their section, or them individually. */
export async function getNotificationsForStudent(studentId: string, sectionId: string | null, branchId: string) {
  return db.notification.findMany({
    where: {
      branchId,
      OR: [
        { targetType: "ALL" },
        ...(sectionId ? [{ targetType: "SECTION" as const, sectionId }] : []),
        { targetType: "STUDENT", studentId },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listNotificationsSentByBranch(branchId: string) {
  return db.notification.findMany({
    where: { branchId },
    include: { section: { include: { course: true } }, student: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
