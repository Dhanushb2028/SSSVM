import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listActionableSections } from "@/server/services/section-scope";
import { SectionPickerSelect } from "@/components/shared/section-picker-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteSyllabusTopicAction } from "@/server/actions/syllabus-actions";
import { SyllabusTopicDialog } from "@/components/shared/syllabus-topic-dialog";

export async function SyllabusPageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const sectionId = typeof sp.sectionId === "string" ? sp.sectionId : undefined;

  const [sections, subjects] = await Promise.all([
    session ? listActionableSections(session) : [],
    db.subject.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  const topics = sectionId
    ? await db.syllabusTopic.findMany({ where: { sectionId }, include: { subject: true }, orderBy: { plannedDate: "asc" } })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Syllabus</h1>
          <p className="text-sm text-muted-foreground">Track syllabus topics per section and subject.</p>
        </div>
        {sectionId && <SyllabusTopicDialog mode="create" sectionId={sectionId} subjects={subjects} />}
      </div>
      <SectionPickerSelect paramKey="sectionId" label="Select section" sections={sections} />

      {!sectionId ? (
        <p className="text-sm text-muted-foreground">Select a section above.</p>
      ) : topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No syllabus topics yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Subject</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Topic</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Planned</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">{t.subject.name}</td>
                  <td className="px-3 py-2">{t.topic}</td>
                  <td className="px-3 py-2">{format(t.plannedDate, "d MMM yyyy")}</td>
                  <td className="px-3 py-2">
                    {t.completedDate ? (
                      <StatusBadge tone="success">Completed {format(t.completedDate, "d MMM")}</StatusBadge>
                    ) : (
                      <StatusBadge tone="pending">Planned</StatusBadge>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <SyllabusTopicDialog mode="edit" sectionId={sectionId} subjects={subjects} topic={t} />
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="sm" aria-label={`Delete ${t.topic}`}>
                            <Trash2 aria-hidden="true" className="text-danger" />
                          </Button>
                        }
                        title="Delete syllabus topic"
                        description={`Delete "${t.topic}"?`}
                        confirmLabel="Delete"
                        action={deleteSyllabusTopicAction}
                        hiddenFields={{ id: t.id }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
