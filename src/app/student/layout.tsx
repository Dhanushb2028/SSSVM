import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  UserCircle,
  ClipboardCheck,
  FileBarChart,
  CalendarDays,
  Bell,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { requireRole } from "@/lib/rbac/permissions";
import { getSession } from "@/lib/auth/session";
import { SidebarShell, type SidebarEntry } from "@/components/nav/sidebar-shell";
import { LogoutForm } from "@/components/nav/logout-form";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("STUDENT");
  const session = await getSession();

  const entries: SidebarEntry[] = [
    { type: "link", label: "Home", href: "/student/dashboard", icon: <LayoutDashboard aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Homework", href: "/student/homework", icon: <BookOpen aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Attendance", href: "/student/attendance", icon: <ClipboardCheck aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Results", href: "/student/results", icon: <FileBarChart aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Timetable", href: "/student/timetable", icon: <CalendarDays aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Messages", href: "/student/messages", icon: <MessageSquare aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Notifications", href: "/student/notifications", icon: <Bell aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Gallery", href: "/student/gallery", icon: <ImageIcon aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Videos", href: "/student/videos", icon: <Video aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Profile", href: "/student/profile", icon: <UserCircle aria-hidden="true" className="size-4" /> },
  ];

  return (
    <SidebarShell
      portalLabel="Student"
      entries={entries}
      userName={session?.displayName ?? "Student"}
      userRoleLabel="Student"
      logoutForm={<LogoutForm />}
    >
      {children}
    </SidebarShell>
  );
}
