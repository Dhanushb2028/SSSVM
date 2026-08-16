import { requireRole } from "@/lib/rbac/permissions";
import { getSession } from "@/lib/auth/session";
import { TEACHER_NAV } from "@/lib/nav/teacher-nav";
import { SidebarShell, type SidebarEntry } from "@/components/nav/sidebar-shell";
import { LogoutForm } from "@/components/nav/logout-form";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireRole("TEACHER");
  const session = await getSession();

  const entries: SidebarEntry[] = TEACHER_NAV.map((category) => {
    const items = category.items.map((item) => ({
      label: item.label,
      href: item.href,
      icon: <item.icon aria-hidden="true" className="size-4" />,
    }));
    if (items.length === 1) {
      return { type: "link", label: category.title, href: items[0].href, icon: items[0].icon };
    }
    return { type: "group", title: category.title, icon: <category.icon aria-hidden="true" className="size-4" />, items };
  });

  return (
    <SidebarShell
      portalLabel="Teacher"
      entries={entries}
      userName={session?.displayName ?? "Teacher"}
      userRoleLabel="Teacher"
      logoutForm={<LogoutForm />}
    >
      {children}
    </SidebarShell>
  );
}
