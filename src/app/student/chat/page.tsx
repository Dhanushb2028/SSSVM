import { getSession } from "@/lib/auth/session";
import { ChatThreadContent } from "@/components/shared/chat-thread-content";

export default async function StudentChatPage() {
  const session = await getSession();
  if (!session?.studentId) return <p className="text-sm text-muted-foreground">No student profile linked.</p>;
  return <ChatThreadContent studentId={session.studentId} />;
}
