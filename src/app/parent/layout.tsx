import { LayoutDashboard, BookOpen, MessageSquare, UserCircle } from "lucide-react";
import { requireRole } from "@/lib/rbac/permissions";
import { getSession } from "@/lib/auth/session";
import { MobileShell } from "@/components/nav/mobile-shell";
import { LogoutForm } from "@/components/nav/logout-form";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("PARENT");
  const session = await getSession();

  const navItems = [
    { label: "Home", href: "/parent/dashboard", icon: <LayoutDashboard aria-hidden="true" className="size-5" /> },
    { label: "Homework", href: "/parent/homework", icon: <BookOpen aria-hidden="true" className="size-5" /> },
    { label: "Messages", href: "/parent/messages", icon: <MessageSquare aria-hidden="true" className="size-5" /> },
    { label: "Profile", href: "/parent/profile", icon: <UserCircle aria-hidden="true" className="size-5" /> },
  ];

  return (
    <MobileShell
      portalLabel="Parent"
      navItems={navItems}
      userName={session?.displayName ?? "Parent"}
      logoutForm={<LogoutForm />}
    >
      {children}
    </MobileShell>
  );
}
