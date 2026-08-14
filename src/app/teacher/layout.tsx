import {
  LayoutDashboard,
  UserCircle,
  ClipboardCheck,
  CalendarDays,
  BookMarked,
  CalendarClock,
  NotebookPen,
  PenLine,
} from "lucide-react";
import { requireRole } from "@/lib/rbac/permissions";
import { getSession } from "@/lib/auth/session";
import { DesktopShell, type NavSection } from "@/components/nav/desktop-shell";
import { LogoutForm } from "@/components/nav/logout-form";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireRole("TEACHER");
  const session = await getSession();

  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [{ label: "Dashboard", href: "/teacher/dashboard", icon: <LayoutDashboard aria-hidden="true" className="size-4" /> }],
    },
    {
      title: "Academics",
      items: [
        { label: "Mark Attendance", href: "/teacher/attendance/mark", icon: <ClipboardCheck aria-hidden="true" className="size-4" /> },
        { label: "Timetable", href: "/teacher/timetable", icon: <CalendarDays aria-hidden="true" className="size-4" /> },
        { label: "Syllabus", href: "/teacher/syllabus", icon: <BookMarked aria-hidden="true" className="size-4" /> },
        { label: "Schedule / Calendar", href: "/teacher/schedule", icon: <CalendarClock aria-hidden="true" className="size-4" /> },
        { label: "Monthly Lesson Plans", href: "/teacher/lesson-plans", icon: <NotebookPen aria-hidden="true" className="size-4" /> },
        { label: "Marks Entry", href: "/teacher/exams/marks-entry", icon: <PenLine aria-hidden="true" className="size-4" /> },
      ],
    },
    {
      title: "Account",
      items: [{ label: "Profile", href: "/teacher/profile", icon: <UserCircle aria-hidden="true" className="size-4" /> }],
    },
  ];

  return (
    <DesktopShell
      portalLabel="Teacher"
      navSections={navSections}
      userName={session?.displayName ?? "Teacher"}
      userRoleLabel="Teacher"
      logoutForm={<LogoutForm />}
    >
      {children}
    </DesktopShell>
  );
}
