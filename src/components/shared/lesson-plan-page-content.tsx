import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listActionableSections } from "@/server/services/section-scope";
import { SectionPickerSelect } from "@/components/shared/section-picker-select";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import { LessonPlanForm } from "@/components/shared/lesson-plan-form";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function LessonPlanPageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const sectionId = typeof sp.sectionId === "string" ? sp.sectionId : undefined;
  const now = new Date();
  const month = typeof sp.month === "string" ? Number(sp.month) : now.getMonth() + 1;
  const year = typeof sp.year === "string" ? Number(sp.year) : now.getFullYear();

  const [sections, subjects] = await Promise.all([
    session ? listActionableSections(session) : [],
    db.subject.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);
  const subjectId = typeof sp.subjectId === "string" ? sp.subjectId : subjects[0]?.id;

  const existing =
    sectionId && subjectId
      ? await db.monthlyLessonPlan.findUnique({
          where: { sectionId_subjectId_month_year: { sectionId, subjectId, month, year } },
        })
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Monthly Lesson Plans</h1>
        <p className="text-sm text-muted-foreground">One plan per section, subject, and month.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <SectionPickerSelect paramKey="sectionId" label="Select section" sections={sections} />
        <UrlFilterSelect paramKey="subjectId" placeholder="Subject" options={subjects.map((s) => ({ value: s.id, label: s.name }))} />
        <UrlFilterSelect
          paramKey="month"
          placeholder="Month"
          options={MONTH_NAMES.map((m, i) => ({ value: String(i + 1), label: m }))}
        />
      </div>

      {sectionId && subjectId ? (
        <LessonPlanForm
          key={`${sectionId}-${subjectId}-${month}-${year}`}
          sectionId={sectionId}
          subjectId={subjectId}
          month={month}
          year={year}
          initialText={existing?.planText ?? ""}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Select a section and subject above.</p>
      )}
    </div>
  );
}
