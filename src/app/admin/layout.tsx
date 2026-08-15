import type { ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarRange,
  Building2,
  Landmark,
  Users,
  ShieldCheck,
  UserCircle,
  LayoutGrid,
  GraduationCap,
  Upload,
  ArrowUpCircle,
  ArrowLeftRight,
  BarChart3,
  LogOut,
  Trash2,
  IdCard,
  FileCheck2,
  Cake,
  GalleryHorizontal,
  ClipboardCheck,
  ClipboardList,
  CalendarDays,
  BookMarked,
  CalendarClock,
  NotebookPen,
  ListChecks,
  FileEdit,
  PenLine,
  Ticket,
  FileBarChart,
  Trophy,
  Table2,
  Layers,
  BookOpen,
  Bell,
  Megaphone,
  Image as ImageIcon,
  Video,
  MessageCircle,
  Send,
  Wallet,
  Receipt,
  BookText,
  Landmark as BankIcon,
  FileSpreadsheet,
} from "lucide-react";
import { requireRole, hasPermission } from "@/lib/rbac/permissions";
import { getSession } from "@/lib/auth/session";
import type { ModuleKey } from "@/lib/rbac/modules";
import { DesktopShell, type NavSection } from "@/components/nav/desktop-shell";
import { LogoutForm } from "@/components/nav/logout-form";
import type { AppSession } from "@/lib/auth/session";

type NavItemDef = { label: string; href: string; icon: ReactNode; module: ModuleKey };

function buildSection(session: AppSession | null, title: string, items: NavItemDef[]): NavSection | null {
  const visible = items.filter((item) => hasPermission(session, item.module, "VIEW"));
  if (visible.length === 0) return null;
  return { title, items: visible.map(({ label, href, icon }) => ({ label, href, icon })) };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  const session = await getSession();
  const icon = (Icon: typeof LayoutDashboard) => <Icon aria-hidden="true" className="size-4" />;

  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [{ label: "Dashboard", href: "/admin/dashboard", icon: icon(LayoutDashboard) }],
    },
  ];

  const systemSetup = buildSection(session, "System Setup", [
    { label: "Academic Years", href: "/admin/system-setup/academic-years", icon: icon(CalendarRange), module: "system.academic_years" },
    { label: "Organizations", href: "/admin/system-setup/organizations", icon: icon(Landmark), module: "system.organizations" },
    { label: "Branches", href: "/admin/system-setup/branches", icon: icon(Building2), module: "system.branches" },
    { label: "Courses & Subjects", href: "/admin/system-setup/master-data", icon: icon(Layers), module: "system.master_data" },
  ]);
  if (systemSetup) navSections.push(systemSetup);

  const usersRoles = buildSection(session, "Users & Roles", [
    { label: "User Accounts", href: "/admin/users/accounts", icon: icon(Users), module: "users.accounts" },
    { label: "Roles & Permissions", href: "/admin/users/roles", icon: icon(ShieldCheck), module: "users.roles" },
  ]);
  if (usersRoles) navSections.push(usersRoles);

  const sections = buildSection(session, "Sections", [
    { label: "Sections", href: "/admin/sections", icon: icon(LayoutGrid), module: "sections.manage" },
  ]);
  if (sections) navSections.push(sections);

  const sis = buildSection(session, "Student Information", [
    { label: "Student Master", href: "/admin/sis/students", icon: icon(GraduationCap), module: "sis.students" },
    { label: "Bulk Upload", href: "/admin/sis/bulk-upload", icon: icon(Upload), module: "sis.bulk_upload" },
    { label: "Promote", href: "/admin/sis/promote", icon: icon(ArrowUpCircle), module: "sis.promote" },
    { label: "Section Change", href: "/admin/sis/section-change", icon: icon(ArrowLeftRight), module: "sis.section_change" },
    { label: "Strength / Abstract", href: "/admin/sis/reports", icon: icon(BarChart3), module: "sis.reports" },
    { label: "Outgoing Students", href: "/admin/sis/outgoing", icon: icon(LogOut), module: "sis.outgoing" },
    { label: "Trash", href: "/admin/sis/trash", icon: icon(Trash2), module: "sis.trash" },
    { label: "ID Cards", href: "/admin/sis/id-cards", icon: icon(IdCard), module: "sis.id_cards" },
    { label: "Certificate Permission", href: "/admin/sis/certificate-permission", icon: icon(FileCheck2), module: "sis.certificate_permission" },
    { label: "Birthday List", href: "/admin/sis/birthdays", icon: icon(Cake), module: "sis.birthdays" },
    { label: "App Home Banners", href: "/admin/sis/banners", icon: icon(GalleryHorizontal), module: "sis.app_banners" },
  ]);
  if (sis) navSections.push(sis);

  const attendance = buildSection(session, "Attendance", [
    { label: "Mark Attendance", href: "/admin/attendance/mark", icon: icon(ClipboardCheck), module: "attendance.mark" },
    { label: "Absentee Report", href: "/admin/attendance/reports", icon: icon(ClipboardList), module: "attendance.reports" },
  ]);
  if (attendance) navSections.push(attendance);

  const academics = buildSection(session, "Academics", [
    { label: "Timetable", href: "/admin/academics/timetable", icon: icon(CalendarDays), module: "academics.timetable" },
    { label: "Syllabus", href: "/admin/academics/syllabus", icon: icon(BookMarked), module: "academics.syllabus" },
    { label: "Schedule / Calendar", href: "/admin/academics/schedule", icon: icon(CalendarClock), module: "academics.schedule" },
    { label: "Monthly Lesson Plans", href: "/admin/academics/lesson-plans", icon: icon(NotebookPen), module: "academics.lesson_plans" },
  ]);
  if (academics) navSections.push(academics);

  const exams = buildSection(session, "Exams", [
    { label: "Exam Types", href: "/admin/exams/types", icon: icon(ListChecks), module: "exams.types" },
    { label: "Exams", href: "/admin/exams/exams", icon: icon(FileEdit), module: "exams.exams" },
    { label: "Exam Timetable", href: "/admin/exams/exam-timetable", icon: icon(Table2), module: "exams.timetable" },
    { label: "Marks Entry", href: "/admin/exams/marks-entry", icon: icon(PenLine), module: "exams.marks" },
    { label: "Hall Tickets", href: "/admin/exams/hall-tickets", icon: icon(Ticket), module: "exams.hall_tickets" },
    { label: "Progress Reports", href: "/admin/exams/progress-reports", icon: icon(FileBarChart), module: "exams.progress_reports" },
    { label: "Competitive Exam Marks", href: "/admin/exams/competitive", icon: icon(Trophy), module: "exams.competitive" },
    { label: "Result Reports", href: "/admin/exams/results", icon: icon(BarChart3), module: "exams.reports" },
  ]);
  if (exams) navSections.push(exams);

  const communication = buildSection(session, "Communication", [
    { label: "Homework", href: "/admin/homework", icon: icon(BookOpen), module: "homework.manage" },
    { label: "Notifications", href: "/admin/notifications", icon: icon(Bell), module: "comms.notifications" },
    { label: "Circulars", href: "/admin/circulars", icon: icon(Megaphone), module: "comms.circulars" },
    { label: "Gallery", href: "/admin/gallery", icon: icon(ImageIcon), module: "comms.gallery" },
    { label: "Videos", href: "/admin/videos", icon: icon(Video), module: "comms.videos" },
    { label: "Chat", href: "/admin/chat", icon: icon(MessageCircle), module: "comms.chat" },
    { label: "Bulk SMS", href: "/admin/bulk-sms", icon: icon(Send), module: "comms.sms" },
  ]);
  if (communication) navSections.push(communication);

  const finance = buildSection(session, "Finance", [
    { label: "Fee Structure", href: "/admin/finance/fee-structure", icon: icon(Wallet), module: "finance.fee_structure" },
    { label: "Fee Ledger", href: "/admin/finance/ledger", icon: icon(Receipt), module: "finance.transactions" },
    { label: "Fee Due Report", href: "/admin/finance/fee-due", icon: icon(FileSpreadsheet), module: "finance.reports" },
    { label: "Expenditure", href: "/admin/finance/expenditure", icon: icon(BookText), module: "finance.expenditure" },
    { label: "Banking", href: "/admin/finance/banking", icon: icon(BankIcon), module: "finance.banking" },
    { label: "Reports", href: "/admin/finance/reports", icon: icon(BarChart3), module: "finance.reports" },
  ]);
  if (finance) navSections.push(finance);

  navSections.push({
    title: "Account",
    items: [{ label: "Profile", href: "/admin/profile", icon: icon(UserCircle) }],
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
