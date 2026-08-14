import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listActionableSections } from "@/server/services/section-scope";
import { CircularDialog } from "@/components/shared/circular-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteCircularAction } from "@/server/actions/circular-actions";

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

export async function CircularsPageContent() {
  const session = await getSession();
  const branchId = session ? await resolveBranchId(session) : null;
  const sections = session ? await listActionableSections(session) : [];
  const circulars = branchId
    ? await db.circular.findMany({ where: { branchId }, include: { section: { include: { course: true } } }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Circulars</h1>
          <p className="text-sm text-muted-foreground">School-wide or class-targeted notices.</p>
        </div>
        {branchId && <CircularDialog branchId={branchId} sections={sections} allowSchoolWide={session?.role === "ADMIN"} />}
      </div>

      <ul className="flex flex-col gap-2">
        {circulars.length === 0 && <li className="text-sm text-muted-foreground">No circulars yet.</li>}
        {circulars.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-3 rounded-md border border-border p-3 text-sm">
            <div>
              <p className="font-medium text-foreground">{c.title}</p>
              <p className="text-muted-foreground">{c.section ? `${c.section.course.name} - ${c.section.name}` : "Whole school"}</p>
              <p className="text-foreground">{c.body}</p>
              <p className="text-xs text-muted-foreground">{format(c.createdAt, "d MMM yyyy")}</p>
            </div>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="sm" aria-label={`Delete ${c.title}`}>
                  <Trash2 aria-hidden="true" className="text-danger" />
                </Button>
              }
              title="Delete circular"
              description={`Delete "${c.title}"?`}
              confirmLabel="Delete"
              action={deleteCircularAction}
              hiddenFields={{ id: c.id }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
