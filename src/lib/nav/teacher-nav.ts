import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  MessageCircle,
  UserCircle,
  ClipboardCheck,
  CalendarDays,
  CalendarClock,
  NotebookPen,
  PenLine,
  BookOpen,
  Bell,
  Megaphone,
  Image as ImageIcon,
  Video,
} from "lucide-react";

export type TeacherNavItem = { label: string; href: string; icon: LucideIcon };
export type TeacherNavCategory = { key: string; title: string; icon: LucideIcon; items: TeacherNavItem[] };

export const TEACHER_NAV: TeacherNavCategory[] = [
  {
    key: "academics",
    title: "Academics",
    icon: BookMarked,
    items: [
      { label: "Mark Attendance", href: "/teacher/attendance/mark", icon: ClipboardCheck },
      { label: "Timetable", href: "/teacher/timetable", icon: CalendarDays },
      { label: "Syllabus", href: "/teacher/syllabus", icon: BookMarked },
      { label: "Schedule / Calendar", href: "/teacher/schedule", icon: CalendarClock },
      { label: "Monthly Lesson Plans", href: "/teacher/lesson-plans", icon: NotebookPen },
      { label: "Marks Entry", href: "/teacher/exams/marks-entry", icon: PenLine },
    ],
  },
  {
    key: "communication",
    title: "Communication",
    icon: MessageCircle,
    items: [
      { label: "Homework", href: "/teacher/homework", icon: BookOpen },
      { label: "Notifications", href: "/teacher/notifications", icon: Bell },
      { label: "Circulars", href: "/teacher/circulars", icon: Megaphone },
      { label: "Gallery", href: "/teacher/gallery", icon: ImageIcon },
      { label: "Videos", href: "/teacher/videos", icon: Video },
      { label: "Chat", href: "/teacher/chat", icon: MessageCircle },
    ],
  },
  {
    key: "account",
    title: "Account",
    icon: UserCircle,
    items: [{ label: "Profile", href: "/teacher/profile", icon: UserCircle }],
  },
];

export function findTeacherCategory(key: string): TeacherNavCategory | undefined {
  return TEACHER_NAV.find((c) => c.key === key);
}
