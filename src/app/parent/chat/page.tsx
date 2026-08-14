import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ChatThreadContent } from "@/components/shared/chat-thread-content";

export default async function ParentChatPage({
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

  if (!activeId) return <p className="text-sm text-muted-foreground">No children linked.</p>;

  return (
    <div className="flex flex-col gap-3">
      {links.length > 1 && (
        <div className="flex gap-2">
          {links.map((l) => (
            <Link
              key={l.student.id}
              href={`/parent/chat?studentId=${l.student.id}`}
              className={`rounded-full px-3 py-1 text-xs ${l.student.id === activeId ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
            >
              {l.student.firstName}
            </Link>
          ))}
        </div>
      )}
      <ChatThreadContent studentId={activeId} />
    </div>
  );
}
