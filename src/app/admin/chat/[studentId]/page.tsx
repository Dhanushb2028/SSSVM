import { notFound } from "next/navigation";
import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { assertBranchAccess } from "@/lib/rbac/scope";
import { db } from "@/lib/db";
import { ChatThreadContent } from "@/components/shared/chat-thread-content";

export default async function AdminChatThreadPage({ params }: { params: Promise<{ studentId: string }> }) {
  const session = await requirePermissionOrRedirect("comms.chat", "VIEW");
  const { studentId } = await params;
  const student = await db.student.findUnique({ where: { id: studentId }, select: { branchId: true } });
  if (!student) notFound();
  assertBranchAccess(session, student.branchId);
  return <ChatThreadContent studentId={studentId} />;
}
