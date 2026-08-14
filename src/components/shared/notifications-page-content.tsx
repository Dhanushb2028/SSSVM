import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listActionableSections } from "@/server/services/section-scope";
import { listNotificationsSentByBranch } from "@/server/services/notifications-feed";
import { SendNotificationDialog } from "@/components/shared/send-notification-dialog";
import { StatusBadge } from "@/components/ui/status-badge";

async function resolveBranchId(session: NonNullable<Awaited<ReturnType<typeof getSession>>>): Promise<string | null> {
  if (session.role === "ADMIN") {
    if (session.branchId) return session.branchId;
    const first = await db.branch.findFirst({ where: { deletedAt: null }, orderBy: { name: "asc" } });
    return first?.id ?? null;
  }
  if (session.role === "TEACHER" && session.staffMemberId) {
    const staff = await db.staffMember.findUnique({ where: { id: session.staffMemberId }, select: { branchId: true } });
    return staff?.branchId ?? null;
  }
  return null;
}

export async function NotificationsPageContent() {
  const session = await getSession();
  const branchId = session ? await resolveBranchId(session) : null;
  const sections = session ? await listActionableSections(session) : [];
  const students = branchId
    ? await db.student.findMany({
        where: { deletedAt: null, status: "ACTIVE", sectionId: { in: sections.map((s) => s.id) } },
        select: { id: true, sectionId: true, firstName: true, lastName: true, admissionNumber: true },
      })
    : [];
  const sent = branchId ? await listNotificationsSentByBranch(branchId) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">Push a targeted notification to a class, section, or individual student.</p>
        </div>
        {branchId && (
          <SendNotificationDialog
            branchId={branchId}
            sections={sections}
            students={students.filter((s): s is typeof s & { sectionId: string } => s.sectionId !== null)}
            allowAll={session?.role === "ADMIN"}
          />
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {sent.length === 0 && <li className="text-sm text-muted-foreground">No notifications sent yet.</li>}
        {sent.map((n) => (
          <li key={n.id} className="rounded-md border border-border p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-foreground">{n.title}</p>
              <StatusBadge tone="neutral">
                {n.targetType === "ALL" ? "Everyone" : n.targetType === "SECTION" ? `${n.section?.course.name} - ${n.section?.name}` : `${n.student?.firstName} ${n.student?.lastName}`}
              </StatusBadge>
            </div>
            <p className="text-muted-foreground">{n.body}</p>
            <p className="text-xs text-muted-foreground">{format(n.createdAt, "d MMM yyyy, h:mm a")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
