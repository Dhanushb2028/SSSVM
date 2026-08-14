import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getCircularsForStudent } from "@/server/services/circulars-feed";
import { Card, CardContent } from "@/components/ui/card";

export default async function StudentMessagesPage() {
  const session = await getSession();
  const student = session?.studentId ? await db.student.findUnique({ where: { id: session.studentId } }) : null;
  const circulars = student ? await getCircularsForStudent(student.branchId, student.sectionId) : [];

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
