import Link from "next/link";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listActionableSections } from "@/server/services/section-scope";
import { listHomeworkForSection } from "@/server/services/homework";
import { SectionPickerSelect } from "@/components/shared/section-picker-select";
import { HomeworkFormDialog } from "@/components/shared/homework-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteHomeworkAction } from "@/server/actions/homework-actions";
import { basePathFor } from "@/lib/portal-path";

export async function HomeworkPageContent({
  searchParams,
  portal,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  portal: "admin" | "teacher";
}) {
  const session = await getSession();
  const sp = await searchParams;
  const sectionId = typeof sp.sectionId === "string" ? sp.sectionId : undefined;

  const [sections, subjects] = await Promise.all([
    session ? listActionableSections(session) : [],
    db.subject.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  const homework = sectionId ? await listHomeworkForSection(sectionId) : [];
  const base = basePathFor(portal);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Homework</h1>
          <p className="text-sm text-muted-foreground">Post assignments and track submissions per section.</p>
        </div>
        {sectionId && <HomeworkFormDialog sectionId={sectionId} subjects={subjects} />}
      </div>
      <SectionPickerSelect paramKey="sectionId" label="Select section" sections={sections} />

      {!sectionId ? (
        <p className="text-sm text-muted-foreground">Select a section above.</p>
      ) : homework.length === 0 ? (
        <p className="text-sm text-muted-foreground">No homework posted yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {homework.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm">
              <div>
                <Link href={`${base}/homework/${h.id}`} className="font-medium text-primary hover:underline">
                  {h.subject.name} — due {format(h.dueDate, "d MMM yyyy")}
                </Link>
                <p className="text-muted-foreground">{h.description}</p>
                <p className="text-muted-foreground">{h._count.submissions} submission(s)</p>
              </div>
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="sm" aria-label="Delete homework">
                    <Trash2 aria-hidden="true" className="text-danger" />
                  </Button>
                }
                title="Delete homework"
                description="Delete this homework and all its submissions?"
                confirmLabel="Delete"
                action={deleteHomeworkAction}
                hiddenFields={{ id: h.id }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
