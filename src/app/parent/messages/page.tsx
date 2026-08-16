import Link from "next/link";
import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getCircularsForStudent } from "@/server/services/circulars-feed";
import { getThreadMessages, senderName } from "@/server/services/chat";
import { ChatThreadView } from "@/components/shared/chat-thread-view";
import { Card, CardContent } from "@/components/ui/card";

export default async function ParentMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const links = session?.guardianId
    ? await db.studentGuardian.findMany({ where: { guardianId: session.guardianId }, include: { student: true } })
    : [];
  const sp = await searchParams;
  const requestedId = typeof sp.studentId === "string" ? sp.studentId : undefined;
  const activeId = links.find((l) => l.student.id === requestedId)?.student.id ?? links[0]?.student.id;
  const activeStudent = links.find((l) => l.student.id === activeId)?.student;

  // Circulars are branch/section-wide, so children in the same branch/section see duplicates —
  // de-duplicate by circular id across all linked children.
  const perChild = await Promise.all(links.map((l) => getCircularsForStudent(l.student.branchId, l.student.sectionId)));
  const seen = new Map<string, (typeof perChild)[number][number]>();
  for (const list of perChild) for (const c of list) seen.set(c.id, c);
  const circulars = Array.from(seen.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const threadMessages = activeId ? await getThreadMessages(activeId) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">Chat with your child&apos;s teacher, and school-wide announcements.</p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-foreground">From your child&apos;s teacher</h2>
        {links.length > 1 && (
          <div className="flex gap-2">
            {links.map((l) => (
              <Link
                key={l.student.id}
                href={`/parent/messages?studentId=${l.student.id}`}
                className={`rounded-full px-3 py-1 text-xs ${l.student.id === activeId ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
              >
                {l.student.firstName}
              </Link>
            ))}
          </div>
        )}
        {activeStudent ? (
          <ChatThreadView
            studentId={activeStudent.id}
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
            <CardContent className="pt-6 text-sm text-muted-foreground">No children linked.</CardContent>
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
