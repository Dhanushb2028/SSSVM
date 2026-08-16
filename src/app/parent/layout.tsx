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

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("PARENT");
  const session = await getSession();

  const entries: SidebarEntry[] = [
    { type: "link", label: "Home", href: "/parent/dashboard", icon: <LayoutDashboard aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Homework", href: "/parent/homework", icon: <BookOpen aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Attendance", href: "/parent/attendance", icon: <ClipboardCheck aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Results", href: "/parent/results", icon: <FileBarChart aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Timetable", href: "/parent/timetable", icon: <CalendarDays aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Messages", href: "/parent/messages", icon: <MessageSquare aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Notifications", href: "/parent/notifications", icon: <Bell aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Gallery", href: "/parent/gallery", icon: <ImageIcon aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Videos", href: "/parent/videos", icon: <Video aria-hidden="true" className="size-4" /> },
    { type: "link", label: "Profile", href: "/parent/profile", icon: <UserCircle aria-hidden="true" className="size-4" /> },
  ];

  return (
    <SidebarShell
      portalLabel="Parent"
      entries={entries}
      userName={session?.displayName ?? "Parent"}
      userRoleLabel="Parent"
      logoutForm={<LogoutForm />}
    >
      {children}
    </SidebarShell>
  );
}
