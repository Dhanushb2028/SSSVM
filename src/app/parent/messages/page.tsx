import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getCircularsForStudent } from "@/server/services/circulars-feed";
import { Card, CardContent } from "@/components/ui/card";

export default async function ParentMessagesPage() {
  const session = await getSession();
  const links = session?.guardianId
    ? await db.studentGuardian.findMany({ where: { guardianId: session.guardianId }, include: { student: true } })
    : [];

  // Circulars are branch/section-wide, so children in the same branch/section see duplicates —
  // de-duplicate by circular id across all linked children.
  const perChild = await Promise.all(links.map((l) => getCircularsForStudent(l.student.branchId, l.student.sectionId)));
  const seen = new Map<string, (typeof perChild)[number][number]>();
  for (const list of perChild) for (const c of list) seen.set(c.id, c);
  const circulars = Array.from(seen.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-semibold text-foreground">Messages</h1>
      {circulars.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">No messages yet.</CardContent>
        </Card>
      ) : (
        circulars.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-col gap-1 pt-6 text-sm">
              <p className="font-medium text-foreground">{c.title}</p>
              <p className="text-foreground">{c.body}</p>
              <p className="text-xs text-muted-foreground">{format(c.createdAt, "d MMM yyyy")}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
