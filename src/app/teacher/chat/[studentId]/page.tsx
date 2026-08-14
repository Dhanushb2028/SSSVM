import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/rbac/permissions";
import { getTeacherSectionIds } from "@/lib/rbac/scope";
import { db } from "@/lib/db";
import { ChatThreadContent } from "@/components/shared/chat-thread-content";

export default async function TeacherChatThreadPage({ params }: { params: Promise<{ studentId: string }> }) {
  const session = await requireRole("TEACHER");
  const { studentId } = await params;
  const student = await db.student.findUnique({ where: { id: studentId }, select: { sectionId: true } });
  if (!student) notFound();
  const sectionIds = await getTeacherSectionIds(session);
  if (!student.sectionId || !sectionIds.includes(student.sectionId)) redirect("/403");
  return <ChatThreadContent studentId={studentId} />;
}
