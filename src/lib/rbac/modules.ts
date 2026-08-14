// Registry of admin-gated modules (Section 6) used by PermissionProfile grants.
// TEACHER/STUDENT/PARENT access is scoped by row-ownership, not by these module
// grants — see requireOwnSection / requireOwnStudent in lib/rbac/scope.ts.

export const MODULE_GROUPS = [
  {
    group: "System Setup",
    modules: [
      { key: "system.academic_years", label: "Academic Years" },
      { key: "system.organizations", label: "Organizations" },
      { key: "system.branches", label: "Branches" },
    ],
  },
  {
    group: "Users & Roles",
    modules: [
      { key: "users.accounts", label: "User Accounts" },
      { key: "users.roles", label: "Roles / Permission Profiles" },
    ],
  },
  {
    group: "Admissions",
    modules: [
      { key: "admissions.enquiries", label: "Enquiry CRM" },
      { key: "admissions.meo", label: "MEO Management" },
      { key: "admissions.applications", label: "Applications" },
      { key: "admissions.reports", label: "Admissions Reports" },
    ],
  },
  {
    group: "Student Information",
    modules: [
      { key: "sis.students", label: "Student Master" },
      { key: "sis.bulk_upload", label: "Bulk Upload" },
      { key: "sis.promote", label: "Promote" },
      { key: "sis.section_change", label: "Section Change" },
      { key: "sis.reports", label: "Strength / Abstract Reports" },
      { key: "sis.outgoing", label: "Outgoing Students" },
      { key: "sis.trash", label: "Trash" },
      { key: "sis.id_cards", label: "ID Cards" },
      { key: "sis.certificate_permission", label: "Certificate Permission" },
      { key: "sis.birthdays", label: "Birthday List" },
      { key: "sis.app_banners", label: "App Home Banners" },
    ],
  },
  {
    group: "Sections",
    modules: [{ key: "sections.manage", label: "Sections & Class Management" }],
  },
  {
    group: "Attendance",
    modules: [
      { key: "attendance.mark", label: "Mark Attendance" },
      { key: "attendance.reports", label: "Absentee Reports" },
    ],
  },
  {
    group: "Academics",
    modules: [
      { key: "academics.syllabus", label: "Syllabus" },
      { key: "academics.schedule", label: "Schedule / Calendar" },
      { key: "academics.lesson_plans", label: "Monthly Lesson Plans" },
      { key: "academics.timetable", label: "Timetable" },
    ],
  },
  {
    group: "Exams",
    modules: [
      { key: "exams.types", label: "Exam Types" },
      { key: "exams.exams", label: "Exams" },
      { key: "exams.timetable", label: "Exam Timetable" },
      { key: "exams.marks", label: "Marks Entry" },
      { key: "exams.hall_tickets", label: "Hall Tickets" },
      { key: "exams.progress_reports", label: "Progress Reports" },
      { key: "exams.competitive", label: "Competitive Exam Marks" },
      { key: "exams.reports", label: "Result Reports" },
    ],
  },
  {
    group: "Homework & Communication",
    modules: [
      { key: "homework.manage", label: "Homework" },
      { key: "comms.notifications", label: "Notifications" },
      { key: "comms.circulars", label: "Circulars" },
      { key: "comms.gallery", label: "Gallery" },
      { key: "comms.videos", label: "Videos" },
      { key: "comms.chat", label: "Chat" },
      { key: "comms.sms", label: "Bulk SMS" },
    ],
  },
  {
    group: "Finance",
    modules: [
      { key: "finance.fee_structure", label: "Fee Structure" },
      { key: "finance.transactions", label: "Fee Transactions / Ledger / Receipts" },
      { key: "finance.expenditure", label: "Expenditure" },
      { key: "finance.banking", label: "Banking" },
      { key: "finance.reports", label: "Finance Reports" },
    ],
  },
  {
    group: "Staff / HR",
    modules: [
      { key: "hr.staff", label: "Staff Master" },
      { key: "hr.payroll", label: "Payroll" },
      { key: "hr.attendance", label: "Staff Attendance / OD" },
    ],
  },
  {
    group: "Transport",
    modules: [
      { key: "transport.vehicles", label: "Vehicles" },
      { key: "transport.routes", label: "Routes & Stops" },
    ],
  },
  {
    group: "Hostel",
    modules: [{ key: "hostel.manage", label: "Hostel" }],
  },
  {
    group: "Certificates",
    modules: [{ key: "certificates.tc", label: "Transfer Certificates" }],
  },
] as const;

export const ALL_MODULE_KEYS = MODULE_GROUPS.flatMap((g) => g.modules.map((m) => m.key));

export type ModuleKey = (typeof ALL_MODULE_KEYS)[number];

export const PERMISSION_ACTIONS = ["VIEW", "CREATE", "EDIT", "DELETE", "EXPORT"] as const;
export type PermissionActionKey = (typeof PERMISSION_ACTIONS)[number];
