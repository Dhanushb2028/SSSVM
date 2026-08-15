import { Bell, Image as ImageIcon, Video, MessageCircle, ClipboardCheck, FileBarChart, CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { QuickLinksGrid } from "@/components/shared/quick-links-grid";
import { StudentFeeSummary } from "@/components/shared/student-fee-summary";
import { StudentAttendanceSummary } from "@/components/shared/student-attendance-summary";

const QUICK_LINKS = [
  { label: "Attendance", href: "/student/attendance", icon: ClipboardCheck },
  { label: "Results", href: "/student/results", icon: FileBarChart },
  { label: "Timetable", href: "/student/timetable", icon: CalendarDays },
  { label: "Notifications", href: "/student/notifications", icon: Bell },
  { label: "Gallery", href: "/student/gallery", icon: ImageIcon },
  { label: "Videos", href: "/student/videos", icon: Video },
  { label: "Chat", href: "/student/chat", icon: MessageCircle },
];

export default async function StudentDashboardPage() {
  const session = await getSession();
  const student = session?.studentId
    ? await db.student.findUnique({
        where: { id: session.studentId },
        include: { branch: true, section: { include: { course: true } } },
      })
    : null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {student ? `${student.firstName} ${student.lastName}` : "Welcome"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {student ? (
            <>
              <p className="text-muted-foreground">
                Admission No. {student.admissionNumber} · {student.branch.name}
              </p>
              <p className="text-muted-foreground">
                {student.section ? `${student.section.course.name} - ${student.section.name}` : "Not yet assigned to a section"}
              </p>
              <StatusBadge tone={student.status === "ACTIVE" ? "success" : "neutral"} className="w-fit">
                {student.status === "ACTIVE" ? "Active" : student.status}
              </StatusBadge>
            </>
          ) : (
            <p className="text-muted-foreground">Your student profile hasn&apos;t been linked yet.</p>
          )}
        </CardContent>
      </Card>

      <QuickLinksGrid links={QUICK_LINKS} />

      {student && <StudentFeeSummary studentId={student.id} branchId={student.branchId} />}
      {student && <StudentAttendanceSummary studentId={student.id} compact />}
    </div>
  );
}
