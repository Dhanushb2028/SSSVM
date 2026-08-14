import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getNotificationsForStudent } from "@/server/services/notifications-feed";
import { Card, CardContent } from "@/components/ui/card";

export default async function StudentNotificationsPage() {
  const session = await getSession();
  const student = session?.studentId ? await db.student.findUnique({ where: { id: session.studentId } }) : null;
  const notifications = student
    ? await getNotificationsForStudent(student.id, student.sectionId, student.branchId)
    : [];

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">No notifications yet.</CardContent>
        </Card>
      ) : (
        notifications.map((n) => (
          <Card key={n.id}>
            <CardContent className="flex flex-col gap-1 pt-6 text-sm">
              <p className="font-medium text-foreground">{n.title}</p>
              <p className="text-foreground">{n.body}</p>
              <p className="text-xs text-muted-foreground">{format(n.createdAt, "d MMM yyyy, h:mm a")}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
