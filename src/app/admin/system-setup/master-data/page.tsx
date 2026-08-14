import { requirePermissionOrRedirect } from "@/lib/rbac/permissions";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForm, SubjectForm, MasterDataList } from "./master-data-forms";

export default async function MasterDataPage() {
  await requirePermissionOrRedirect("system.master_data", "VIEW");

  const [courses, subjects] = await Promise.all([
    db.course.findMany({
      where: { deletedAt: null },
      orderBy: { orderIndex: "asc" },
      include: { _count: { select: { sections: true } } },
    }),
    db.subject.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: { _count: { select: { examSubjects: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Courses &amp; Subjects</h1>
        <p className="text-sm text-muted-foreground">Org-wide master data used by Sections, Timetable, Syllabus, and Exams.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Courses / Grades</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <CourseForm />
            <MasterDataList
              kind="course"
              items={courses.map((c) => ({ id: c.id, name: c.name, usageCount: c._count.sections }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SubjectForm />
            <MasterDataList
              kind="subject"
              items={subjects.map((s) => ({ id: s.id, name: s.name, extra: s.code ?? undefined, usageCount: s._count.examSubjects }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
