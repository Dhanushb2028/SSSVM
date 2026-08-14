import {
  LayoutDashboard,
  UserCircle,
  ClipboardCheck,
  CalendarDays,
  BookMarked,
  CalendarClock,
  NotebookPen,
  PenLine,
  BookOpen,
  Bell,
  Megaphone,
  Image as ImageIcon,
  Video,
  MessageCircle,
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
      title: "Communication",
      items: [
        { label: "Homework", href: "/teacher/homework", icon: <BookOpen aria-hidden="true" className="size-4" /> },
        { label: "Notifications", href: "/teacher/notifications", icon: <Bell aria-hidden="true" className="size-4" /> },
        { label: "Circulars", href: "/teacher/circulars", icon: <Megaphone aria-hidden="true" className="size-4" /> },
        { label: "Gallery", href: "/teacher/gallery", icon: <ImageIcon aria-hidden="true" className="size-4" /> },
        { label: "Videos", href: "/teacher/videos", icon: <Video aria-hidden="true" className="size-4" /> },
        { label: "Chat", href: "/teacher/chat", icon: <MessageCircle aria-hidden="true" className="size-4" /> },
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
