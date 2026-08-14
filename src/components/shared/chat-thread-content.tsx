import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getThreadMessages, senderName } from "@/server/services/chat";
import { ChatThreadView } from "@/components/shared/chat-thread-view";

export async function ChatThreadContent({ studentId }: { studentId: string }) {
  const session = await getSession();
  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student) notFound();

  const messages = await getThreadMessages(studentId);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">
        Chat — {student.firstName} {student.lastName}
      </h1>
      <ChatThreadView
        studentId={studentId}
        currentUserId={session?.userId ?? ""}
        messages={messages.map((m) => ({
          id: m.id,
          body: m.body,
          createdAt: m.createdAt,
          senderUserId: m.senderUserId,
          senderName: senderName(m.sender),
        }))}
      />
    </div>
  );
}
