import { getSession } from "@/lib/auth/session";
import { listActionableSections } from "@/server/services/section-scope";
import { getTimetableForSection, listTimetablePickerData } from "@/server/services/timetable";
import { SectionPickerSelect } from "@/components/shared/section-picker-select";
import { TimetableGrid } from "@/components/shared/timetable-grid";

export async function TimetablePageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const sectionId = typeof sp.sectionId === "string" ? sp.sectionId : undefined;

  const sections = session ? await listActionableSections(session) : [];
  const [entries, picker] = await Promise.all([
    sectionId ? getTimetableForSection(sectionId) : Promise.resolve([]),
    listTimetablePickerData(session?.branchId ?? null),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Timetable</h1>
        <p className="text-sm text-muted-foreground">Select a section, then click a period to set its subject and teacher.</p>
      </div>
      <SectionPickerSelect paramKey="sectionId" label="Select section" sections={sections} />
      {sectionId ? (
        <TimetableGrid sectionId={sectionId} entries={entries} subjects={picker.subjects} teachers={picker.teachers} />
      ) : (
        <p className="text-sm text-muted-foreground">Select a section above to view its timetable.</p>
      )}
    </div>
  );
}
