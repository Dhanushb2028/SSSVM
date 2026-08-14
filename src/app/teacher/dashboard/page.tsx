import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default async function TeacherDashboardPage() {
  const session = await getSession();
  const staff = session?.staffMemberId
    ? await db.staffMember.findUnique({
        where: { id: session.staffMemberId },
        include: { branch: true, classesAsTeacher: { include: { course: true, academicYear: true } } },
      })
    : null;

  const today = new Date().toISOString().slice(0, 10);
  const sectionIds = staff?.classesAsTeacher.map((s) => s.id) ?? [];
  const markedToday = sectionIds.length
    ? await db.attendance.findMany({ where: { sectionId: { in: sectionIds }, date: new Date(today) }, select: { sectionId: true } })
    : [];
  const markedSectionIds = new Set(markedToday.map((a) => a.sectionId));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Welcome, {session?.displayName}</h1>
        <p className="text-sm text-muted-foreground">
          {staff ? `${staff.designation} · ${staff.branch.name}` : "Teacher"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {staff && staff.classesAsTeacher.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {staff.classesAsTeacher.map((section) => {
                const marked = markedSectionIds.has(section.id);
                return (
                  <li key={section.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">
                        {section.course.name} - {section.name}
                      </p>
                      <p className="text-muted-foreground">{section.academicYear.name}</p>
                    </div>
                    {marked ? (
                      <StatusBadge tone="success">Marked</StatusBadge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <StatusBadge tone="warning">Not marked</StatusBadge>
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/teacher/attendance/mark?sectionId=${section.id}&date=${today}`}>Mark now</Link>
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              You are not assigned as class teacher for any section yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start gap-2 text-sm text-muted-foreground">
          {markedSectionIds.size === sectionIds.length && sectionIds.length > 0 ? (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
          ) : (
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          )}
          <p>Homework, marks entry, and communication tools for your sections and subjects arrive in later phases.</p>
        </CardContent>
      </Card>
    </div>
  );
}
