import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getCircularsForStudent } from "@/server/services/circulars-feed";
import { getThreadMessages, senderName } from "@/server/services/chat";
import { ChatThreadView } from "@/components/shared/chat-thread-view";
import { Card, CardContent } from "@/components/ui/card";

export default async function StudentMessagesPage() {
  const session = await getSession();
  const student = session?.studentId ? await db.student.findUnique({ where: { id: session.studentId } }) : null;
  const [circulars, threadMessages] = await Promise.all([
    student ? getCircularsForStudent(student.branchId, student.sectionId) : Promise.resolve([]),
    student ? getThreadMessages(student.id) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">Chat with your teacher, and school-wide announcements.</p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">From your teacher</h2>
        {student ? (
          <ChatThreadView
            studentId={student.id}
            currentUserId={session?.userId ?? ""}
            messages={threadMessages.map((m) => ({
              id: m.id,
              body: m.body,
              createdAt: m.createdAt,
              senderUserId: m.senderUserId,
              senderName: senderName(m.sender),
            }))}
          />
        ) : (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">No student profile linked.</CardContent>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">Announcements</h2>
        {circulars.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">No announcements yet.</CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {circulars.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex flex-col gap-1 pt-6 text-sm">
                  <p className="font-medium text-foreground">{c.title}</p>
                  <p className="text-foreground">{c.body}</p>
                  <p className="text-xs text-muted-foreground">{format(c.createdAt, "d MMM yyyy")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
