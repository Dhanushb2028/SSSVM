import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getNotificationsForStudent } from "@/server/services/notifications-feed";
import { Card, CardContent } from "@/components/ui/card";

export default async function ParentNotificationsPage() {
  const session = await getSession();
  const links = session?.guardianId
    ? await db.studentGuardian.findMany({ where: { guardianId: session.guardianId }, include: { student: true } })
    : [];

  const perChild = await Promise.all(
    links.map(async (link) => ({
      student: link.student,
      notifications: await getNotificationsForStudent(link.student.id, link.student.sectionId, link.student.branchId),
    })),
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
      {perChild.length === 0 && <p className="text-sm text-muted-foreground">No children linked.</p>}
      {perChild.map(({ student, notifications }) => (
        <div key={student.id} className="flex flex-col gap-2">
          {perChild.length > 1 && <h2 className="text-sm font-semibold text-foreground">{student.firstName}</h2>}
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
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
      ))}
    </div>
  );
}
