import { LayoutDashboard, UserCircle } from "lucide-react";
import { requireRole } from "@/lib/rbac/permissions";
import { getSession } from "@/lib/auth/session";
import { MobileShell } from "@/components/nav/mobile-shell";
import { LogoutForm } from "@/components/nav/logout-form";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("STUDENT");
  const session = await getSession();

  const navItems = [
    { label: "Home", href: "/student/dashboard", icon: <LayoutDashboard aria-hidden="true" className="size-5" /> },
    { label: "Profile", href: "/student/profile", icon: <UserCircle aria-hidden="true" className="size-5" /> },
  ];

  return (
    <MobileShell
      portalLabel="Student"
      navItems={navItems}
      userName={session?.displayName ?? "Student"}
      logoutForm={<LogoutForm />}
    >
      {children}
    </MobileShell>
  );
}
