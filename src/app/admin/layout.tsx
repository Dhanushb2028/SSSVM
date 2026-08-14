import { LayoutDashboard, CalendarRange, Building2, Landmark, Users, ShieldCheck, UserCircle } from "lucide-react";
import { requireRole } from "@/lib/rbac/permissions";
import { hasPermission } from "@/lib/rbac/permissions";
import { getSession } from "@/lib/auth/session";
import { DesktopShell, type NavSection } from "@/components/nav/desktop-shell";
import { LogoutForm } from "@/components/nav/logout-form";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  const session = await getSession();

  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [{ label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard aria-hidden="true" className="size-4" /> }],
    },
  ];

  const systemSetupItems = [];
  if (hasPermission(session, "system.academic_years", "VIEW")) {
    systemSetupItems.push({
      label: "Academic Years",
      href: "/admin/system-setup/academic-years",
      icon: <CalendarRange aria-hidden="true" className="size-4" />,
    });
  }
  if (hasPermission(session, "system.organizations", "VIEW")) {
    systemSetupItems.push({
      label: "Organizations",
      href: "/admin/system-setup/organizations",
      icon: <Landmark aria-hidden="true" className="size-4" />,
    });
  }
  if (hasPermission(session, "system.branches", "VIEW")) {
    systemSetupItems.push({
      label: "Branches",
      href: "/admin/system-setup/branches",
      icon: <Building2 aria-hidden="true" className="size-4" />,
    });
  }
  if (systemSetupItems.length > 0) {
    navSections.push({ title: "System Setup", items: systemSetupItems });
  }

  const usersItems = [];
  if (hasPermission(session, "users.accounts", "VIEW")) {
    usersItems.push({
      label: "User Accounts",
      href: "/admin/users/accounts",
      icon: <Users aria-hidden="true" className="size-4" />,
    });
  }
  if (hasPermission(session, "users.roles", "VIEW")) {
    usersItems.push({
      label: "Roles & Permissions",
      href: "/admin/users/roles",
      icon: <ShieldCheck aria-hidden="true" className="size-4" />,
    });
  }
  if (usersItems.length > 0) {
    navSections.push({ title: "Users & Roles", items: usersItems });
  }

  navSections.push({
    title: "Account",
    items: [{ label: "Profile", href: "/admin/profile", icon: <UserCircle aria-hidden="true" className="size-4" /> }],
  });

  return (
    <DesktopShell
      portalLabel="Admin"
      navSections={navSections}
      userName={session?.displayName ?? "Admin"}
      userRoleLabel={session?.isSuperAdmin ? "Full Access Admin" : "Admin"}
      logoutForm={<LogoutForm />}
    >
      {children}
    </DesktopShell>
  );
}
