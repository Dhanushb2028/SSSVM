import "server-only";
import { db } from "@/lib/db";

export async function listHomeworkForSection(sectionId: string) {
  return db.homework.findMany({
    where: { sectionId },
    include: { subject: true, attachments: true, _count: { select: { submissions: true } } },
    orderBy: { dueDate: "desc" },
  });
}

export async function getHomeworkDetail(id: string) {
  return db.homework.findUnique({
    where: { id },
    include: {
      subject: true,
      section: { include: { course: true } },
      attachments: true,
      submissions: { include: { student: true } },
    },
  });
}

export async function listHomeworkForStudent(studentId: string, sectionId: string) {
  const homework = await db.homework.findMany({
    where: { sectionId },
    include: { subject: true, attachments: true, submissions: { where: { studentId } } },
    orderBy: { dueDate: "desc" },
  });
  return homework.map((h) => ({ ...h, mySubmission: h.submissions[0] ?? null }));
}
