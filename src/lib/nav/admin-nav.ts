import type { LucideIcon } from "lucide-react";
import {
  Settings2,
  Users,
  LayoutGrid,
  GraduationCap,
  ClipboardCheck,
  BookMarked,
  FileEdit,
  MessageCircle,
  Wallet,
  Kanban,
  FileCheck2,
  Briefcase,
  Bus,
  UserCircle,
  CalendarRange,
  Landmark,
  Building2,
  Layers,
  ShieldCheck,
  Upload,
  ArrowUpCircle,
  ArrowLeftRight,
  BarChart3,
  LogOut,
  Trash2,
  IdCard,
  Cake,
  GalleryHorizontal,
  ClipboardList,
  CalendarDays,
  CalendarClock,
  NotebookPen,
  ListChecks,
  PenLine,
  Ticket,
  FileBarChart,
  Trophy,
  Table2,
  BookOpen,
  Bell,
  Megaphone,
  Image as ImageIcon,
  Video,
  Send,
  Receipt,
  BookText,
  Landmark as BankIcon,
  FileSpreadsheet,
  UserSearch,
  FileText,
  ClipboardType,
  CalendarCheck,
  IndianRupee,
  Route,
} from "lucide-react";
import type { ModuleKey } from "@/lib/rbac/modules";
import { hasPermission } from "@/lib/rbac/permissions";
import type { AppSession } from "@/lib/auth/session";

export type AdminNavItem = { label: string; href: string; icon: LucideIcon; module?: ModuleKey };
export type AdminNavCategory = { key: string; title: string; icon: LucideIcon; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavCategory[] = [
  {
    key: "system-setup",
    title: "System Setup",
    icon: Settings2,
    items: [
      { label: "Academic Years", href: "/admin/system-setup/academic-years", icon: CalendarRange, module: "system.academic_years" },
      { label: "Organizations", href: "/admin/system-setup/organizations", icon: Landmark, module: "system.organizations" },
      { label: "Branches", href: "/admin/system-setup/branches", icon: Building2, module: "system.branches" },
      { label: "Courses & Subjects", href: "/admin/system-setup/master-data", icon: Layers, module: "system.master_data" },
    ],
  },
  {
    key: "users",
    title: "Users & Roles",
    icon: Users,
    items: [
      { label: "User Accounts", href: "/admin/users/accounts", icon: Users, module: "users.accounts" },
      { label: "Roles & Permissions", href: "/admin/users/roles", icon: ShieldCheck, module: "users.roles" },
    ],
  },
  {
    key: "sections",
    title: "Sections",
    icon: LayoutGrid,
    items: [{ label: "Sections", href: "/admin/sections", icon: LayoutGrid, module: "sections.manage" }],
  },
  {
    key: "sis",
    title: "Student Information",
    icon: GraduationCap,
    items: [
      { label: "Student Master", href: "/admin/sis/students", icon: GraduationCap, module: "sis.students" },
      { label: "Bulk Upload", href: "/admin/sis/bulk-upload", icon: Upload, module: "sis.bulk_upload" },
      { label: "Promote", href: "/admin/sis/promote", icon: ArrowUpCircle, module: "sis.promote" },
      { label: "Section Change", href: "/admin/sis/section-change", icon: ArrowLeftRight, module: "sis.section_change" },
      { label: "Strength / Abstract", href: "/admin/sis/reports", icon: BarChart3, module: "sis.reports" },
      { label: "Outgoing Students", href: "/admin/sis/outgoing", icon: LogOut, module: "sis.outgoing" },
      { label: "Trash", href: "/admin/sis/trash", icon: Trash2, module: "sis.trash" },
      { label: "ID Cards", href: "/admin/sis/id-cards", icon: IdCard, module: "sis.id_cards" },
      { label: "Certificate Permission", href: "/admin/sis/certificate-permission", icon: FileCheck2, module: "sis.certificate_permission" },
      { label: "Birthday List", href: "/admin/sis/birthdays", icon: Cake, module: "sis.birthdays" },
      { label: "App Home Banners", href: "/admin/sis/banners", icon: GalleryHorizontal, module: "sis.app_banners" },
    ],
  },
  {
    key: "attendance",
    title: "Attendance",
    icon: ClipboardCheck,
    items: [
      { label: "Mark Attendance", href: "/admin/attendance/mark", icon: ClipboardCheck, module: "attendance.mark" },
      { label: "Absentee Report", href: "/admin/attendance/reports", icon: ClipboardList, module: "attendance.reports" },
    ],
  },
  {
    key: "academics",
    title: "Academics",
    icon: BookMarked,
    items: [
      { label: "Timetable", href: "/admin/academics/timetable", icon: CalendarDays, module: "academics.timetable" },
      { label: "Syllabus", href: "/admin/academics/syllabus", icon: BookMarked, module: "academics.syllabus" },
      { label: "Schedule / Calendar", href: "/admin/academics/schedule", icon: CalendarClock, module: "academics.schedule" },
      { label: "Monthly Lesson Plans", href: "/admin/academics/lesson-plans", icon: NotebookPen, module: "academics.lesson_plans" },
    ],
  },
  {
    key: "exams",
    title: "Exams",
    icon: FileEdit,
    items: [
      { label: "Exam Types", href: "/admin/exams/types", icon: ListChecks, module: "exams.types" },
      { label: "Exams", href: "/admin/exams/exams", icon: FileEdit, module: "exams.exams" },
      { label: "Exam Timetable", href: "/admin/exams/exam-timetable", icon: Table2, module: "exams.timetable" },
      { label: "Marks Entry", href: "/admin/exams/marks-entry", icon: PenLine, module: "exams.marks" },
      { label: "Hall Tickets", href: "/admin/exams/hall-tickets", icon: Ticket, module: "exams.hall_tickets" },
      { label: "Progress Reports", href: "/admin/exams/progress-reports", icon: FileBarChart, module: "exams.progress_reports" },
      { label: "Competitive Exam Marks", href: "/admin/exams/competitive", icon: Trophy, module: "exams.competitive" },
      { label: "Result Reports", href: "/admin/exams/results", icon: BarChart3, module: "exams.reports" },
    ],
  },
  {
    key: "communication",
    title: "Communication",
    icon: MessageCircle,
    items: [
      { label: "Homework", href: "/admin/homework", icon: BookOpen, module: "homework.manage" },
      { label: "Notifications", href: "/admin/notifications", icon: Bell, module: "comms.notifications" },
      { label: "Circulars", href: "/admin/circulars", icon: Megaphone, module: "comms.circulars" },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon, module: "comms.gallery" },
      { label: "Videos", href: "/admin/videos", icon: Video, module: "comms.videos" },
      { label: "Chat", href: "/admin/chat", icon: MessageCircle, module: "comms.chat" },
      { label: "Bulk SMS", href: "/admin/bulk-sms", icon: Send, module: "comms.sms" },
    ],
  },
  {
    key: "finance",
    title: "Finance",
    icon: Wallet,
    items: [
      { label: "Fee Structure", href: "/admin/finance/fee-structure", icon: Wallet, module: "finance.fee_structure" },
      { label: "Fee Ledger", href: "/admin/finance/ledger", icon: Receipt, module: "finance.transactions" },
      { label: "Fee Due Report", href: "/admin/finance/fee-due", icon: FileSpreadsheet, module: "finance.reports" },
      { label: "Expenditure", href: "/admin/finance/expenditure", icon: BookText, module: "finance.expenditure" },
      { label: "Banking", href: "/admin/finance/banking", icon: BankIcon, module: "finance.banking" },
      { label: "Reports", href: "/admin/finance/reports", icon: BarChart3, module: "finance.reports" },
    ],
  },
  {
    key: "admissions",
    title: "Admissions",
    icon: Kanban,
    items: [
      { label: "Enquiries", href: "/admin/admissions/enquiries", icon: Kanban, module: "admissions.enquiries" },
      { label: "Marketing Officers", href: "/admin/admissions/meo", icon: UserSearch, module: "admissions.meo" },
      { label: "Applications", href: "/admin/admissions/applications", icon: FileText, module: "admissions.applications" },
      { label: "Reports", href: "/admin/admissions/reports", icon: BarChart3, module: "admissions.reports" },
    ],
  },
  {
    key: "certificates",
    title: "Certificates",
    icon: FileCheck2,
    items: [
      { label: "Transfer Certificates", href: "/admin/certificates", icon: FileCheck2, module: "certificates.tc" },
      { label: "Bulk Upload", href: "/admin/certificates/bulk-upload", icon: ClipboardType, module: "certificates.tc" },
    ],
  },
  {
    key: "hr",
    title: "Staff / HR",
    icon: Briefcase,
    items: [
      { label: "Staff Master", href: "/admin/hr/staff", icon: Briefcase, module: "hr.staff" },
      { label: "Attendance / OD", href: "/admin/hr/attendance", icon: CalendarCheck, module: "hr.attendance" },
      { label: "Attendance / OD Report", href: "/admin/hr/attendance/reports", icon: ClipboardList, module: "hr.attendance" },
      { label: "Payroll", href: "/admin/hr/payroll", icon: IndianRupee, module: "hr.payroll" },
    ],
  },
  {
    key: "transport",
    title: "Transport",
    icon: Bus,
    items: [
      { label: "Vehicles", href: "/admin/transport/vehicles", icon: Bus, module: "transport.vehicles" },
      { label: "Routes & Stops", href: "/admin/transport/routes", icon: Route, module: "transport.routes" },
    ],
  },
  {
    key: "account",
    title: "Account",
    icon: UserCircle,
    items: [{ label: "Profile", href: "/admin/profile", icon: UserCircle }],
  },
];

/** Filters categories/items down to what this admin session can actually see, same rule the old sidebar used. */
export function getVisibleAdminNav(session: AppSession | null): AdminNavCategory[] {
  return ADMIN_NAV.map((category) => ({
    ...category,
    items: category.items.filter((item) => !item.module || hasPermission(session, item.module, "VIEW")),
  })).filter((category) => category.items.length > 0);
}

export function findAdminCategory(key: string): AdminNavCategory | undefined {
  return ADMIN_NAV.find((c) => c.key === key);
}
