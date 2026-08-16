import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { listActionableSections } from "@/server/services/section-scope";
import { getMarksRoster } from "@/server/services/exam-marks";
import { SectionPickerSelect } from "@/components/shared/section-picker-select";
import { UrlFilterSelect } from "@/components/data-table/url-filter-select";
import { ExamMarksBoard } from "@/components/shared/exam-marks-board";

export async function MarksEntryPageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const examId = typeof sp.examId === "string" ? sp.examId : undefined;
  const examSubjectId = typeof sp.examSubjectId === "string" ? sp.examSubjectId : undefined;
  const requestedSectionId = typeof sp.sectionId === "string" ? sp.sectionId : undefined;

  const [exams, allSections] = await Promise.all([
    db.exam.findMany({
      where: { deletedAt: null, ...(session?.branchId ? { branchId: session.branchId } : {}) },
      orderBy: { startDate: "desc" },
    }),
    session ? listActionableSections(session) : [],
  ]);

  const selectedExam = examId ? exams.find((e) => e.id === examId) : undefined;
  // Only offer sections in the exam's own grade — entering marks against the wrong grade's
  // roster would corrupt exam records.
  const sections = selectedExam ? allSections.filter((s) => s.courseId === selectedExam.courseId) : allSections;

  // The picker only offers sections this user can act on; re-check membership since the id
  // still arrives via an editable URL param.
  const sectionId = requestedSectionId && sections.some((s) => s.id === requestedSectionId) ? requestedSectionId : undefined;

  const examSubjects = examId
    ? await db.examSubject.findMany({ where: { examId }, include: { subject: true } })
    : [];

  const { examSubject, roster } =
    examSubjectId && sectionId ? await getMarksRoster(examSubjectId, sectionId) : { examSubject: null, roster: [] };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Marks Entry</h1>
        <p className="text-sm text-muted-foreground">Pick an exam, subject, and section to enter marks.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <UrlFilterSelect paramKey="examId" placeholder="Select exam" options={exams.map((e) => ({ value: e.id, label: e.name }))} />
        {examId && (
          <UrlFilterSelect
            paramKey="examSubjectId"
            placeholder="Select subject"
            options={examSubjects.map((es) => ({ value: es.id, label: es.subject.name }))}
          />
        )}
        <SectionPickerSelect paramKey="sectionId" label="Select section" sections={sections} />
      </div>
      {examSubject ? (
        <ExamMarksBoard examSubjectId={examSubject.id} sectionId={sectionId!} maxMarks={examSubject.maxMarks} roster={roster} />
      ) : (
        <p className="text-sm text-muted-foreground">Select an exam, subject, and section above.</p>
      )}
    </div>
  );
}
