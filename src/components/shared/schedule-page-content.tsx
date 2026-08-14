import { format } from "date-fns";
import { Trash2, CalendarDays } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteScheduleEventAction } from "@/server/actions/schedule-actions";
import { ScheduleEventDialog } from "@/components/shared/schedule-event-dialog";

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

export async function SchedulePageContent() {
  const session = await getSession();
  const branchId = session ? await resolveBranchId(session) : null;
  const events = branchId
    ? await db.scheduleEvent.findMany({ where: { branchId }, orderBy: { startDate: "asc" } })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">School Calendar</h1>
          <p className="text-sm text-muted-foreground">School-wide events — holidays, exams, functions.</p>
        </div>
        {branchId && <ScheduleEventDialog branchId={branchId} />}
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-8" />
            <p>No events scheduled yet.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{e.title}</p>
                <p className="text-muted-foreground">
                  {format(e.startDate, "d MMM yyyy")}
                  {e.endDate ? ` – ${format(e.endDate, "d MMM yyyy")}` : ""}
                </p>
                {e.description && <p className="text-muted-foreground">{e.description}</p>}
              </div>
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="sm" aria-label={`Delete ${e.title}`}>
                    <Trash2 aria-hidden="true" className="text-danger" />
                  </Button>
                }
                title="Delete event"
                description={`Delete "${e.title}"?`}
                confirmLabel="Delete"
                action={deleteScheduleEventAction}
                hiddenFields={{ id: e.id }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
