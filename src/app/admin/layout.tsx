import { requireRole } from "@/lib/rbac/permissions";
import { getSession } from "@/lib/auth/session";
import { getVisibleAdminNav } from "@/lib/nav/admin-nav";
import { SidebarShell, type SidebarEntry } from "@/components/nav/sidebar-shell";
import { LogoutForm } from "@/components/nav/logout-form";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  const session = await getSession();

  const entries: SidebarEntry[] = getVisibleAdminNav(session).map((category) => {
    const items = category.items.map((item) => ({
      label: item.label,
      href: item.href,
      icon: <item.icon aria-hidden="true" className="size-4" />,
    }));
    // A single-item category (e.g. "Sections", "Account") is just a link — no need to
    // make the user open a dropdown to reach the one page inside it.
    if (items.length === 1) {
      return { type: "link", label: category.title, href: items[0].href, icon: items[0].icon };
    }
    return { type: "group", title: category.title, icon: <category.icon aria-hidden="true" className="size-4" />, items };
  });

  return (
    <SidebarShell
      portalLabel="Admin"
      entries={entries}
      userName={session?.displayName ?? "Admin"}
      userRoleLabel={session?.isSuperAdmin ? "Full Access Admin" : "Admin"}
      logoutForm={<LogoutForm />}
    >
      {children}
    </SidebarShell>
  );
}
