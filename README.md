# SSSVM School Management System

A PowerSchool-style school management system for **Sree Siva Shankar Vidya Mandir** (K.R.M. Colony) — four portals (Admin, Teacher, Student, Parent) on one Next.js app, one PostgreSQL database, and one Prisma schema. See `ARCHITECTURE.md` for the full stack rationale and design decisions.

## Status: Phase 8 of 10 (HR, Transport, Hostel)

This build follows the phased plan in `ARCHITECTURE.md` §8 / the original spec's Section 12. **Phases 1–8 are complete and demo-able**: project scaffold, auth, RBAC, the shared data-table component, System Setup, Users & Roles, Sections, the full Student Information System core, Attendance + Timetable, Exams & Assessments, Syllabus/Schedule/Lesson Plans, the full Communication module across all four portals, Finance & Fees, Admissions & Certificates, and now Staff/HR, Transport, and Hostel (Staff Master with portal-login generation, Staff Attendance/OD, Payroll, Vehicles, Routes & Stops, and Hostel room allotment). Phases 9–10 (the rest of the Student/Parent portals' feature set, and the accessibility/security hardening pass) are not yet built — see `ARCHITECTURE.md` for the build order.

## Running locally

```bash
# 1. Start Postgres
docker compose up -d

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env   # already done in this checkout; edit if your Postgres differs

# 4. Apply migrations
npx prisma migrate deploy   # or: npx prisma migrate dev (interactive terminals only)

# 5. Seed demo data
npm run db:seed

# 6. Run the app
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`.

## Demo logins

| Role | Identifier | Password | Notes |
|---|---|---|---|
| Admin (full access) | `admin` | `Admin@12345` | Principal account, unrestricted |
| Admin (scoped) | `frontoffice` | `FrontOffice@123` | "Front Office" permission profile — admissions/certificates/ID cards only |
| Teacher | `priya.reddy` | `Teacher@123` | Class teacher of Grade 5-A |
| Student | `9222222222` | `Student@123` | Mobile-number login |
| Parent | `9333333333` | `Parent@123` | Two linked children (siblings, in different sections) — demonstrates the multi-child case |

Staff/admin accounts log in with a **username**; student and parent accounts log in with their **registered mobile number**, per the spec.

## Tests

```bash
npm test          # unit + integration tests (Vitest), requires Postgres running
```

Covers: RBAC permission logic, password hashing, table-parameter parsing (unit), and — per the spec's explicit security requirement — an integration test asserting a parent/student cannot fetch another family's student record by ID manipulation, and that a branch-scoped admin cannot act on another branch's data.

## What's built (Phase 7 adds)

- **Marketing/Enrollment Officers (MEO)**: simple staff-directory CRUD, one per branch, used to attribute enquiries and admissions to a specific officer for reporting.
- **Enquiry CRM**: a kanban board (`NEW → CONTACTED → VISITED → APPLIED → ADMITTED`, plus a `LOST` side-state) with one-click stage advancement; moving a card to `VISITED` increments a `visitCount` counter on the enquiry automatically.
- **Convert to Admission**: one action on an `APPLIED`/later-stage enquiry that validates a unique admission number and, in a single `db.$transaction`, creates a real `Student` record and marks the source enquiry `ADMITTED` with a `convertedStudentId` back-reference — no separate manual re-entry step.
- **Applications**: the same enquiry board component, reused filtered to `APPLIED`+`ADMITTED` only, rather than a second parallel model/UI (see Deliberate scope decisions).
- **Admissions Reports**: totals, fee-commitment sum, and staff/course breakdowns for admitted enquiries in a date range, with CSV export.
- **Transfer Certificates**: an eligibility guardrail (`Student.tcEligible`, toggled in bulk from Phase 2's Certificate Permission screen) gates issuance both at the query level (ineligible students never appear on the TC dashboard) and the action level (a direct action call is still rejected server-side). Issued/not-issued are two separate routes to avoid two `<DataTable>` instances colliding over the same `page`/`sort`/`q` URL params on one page.
- **CBSE Bulk Upload**: CSV backfill of father/mother name, nationality, and category onto existing students (matched by admission number) ahead of CBSE-format TC printing — updates only, never creates new students.
- **Bug-sweep habit continued from Phase 6**: checked every new model introduced this phase for uniquely-constrained fields reachable from a "quick add" `.create()` call (the Phase 6 bug's shape). `MarketingOfficer` has no unique constraint (multiple officers can share a name), so no pre-existence check was needed there; `AdmissionEnquiry`'s only uniqueness (`convertedStudentId`) is set inside the `convertEnquiryAction` transaction after the admission-number uniqueness check already runs, so no unguarded path exists.

## What's built (Phase 8 adds)

- **Staff Master**: full CRUD on `StaffMember` (a model that existed since Phase 1 for teacher accounts but had no admin screen until now) — employee code, designation, department, employment type, qualification, mark-as-left. "Generate Login" creates a Teacher-role portal login for a staff member who doesn't have one yet; non-teaching staff can exist purely as HR/payroll records with no login at all.
- **Staff Attendance / OD**: a daily bulk-mark screen for all active staff at a branch (Present/Absent/Half day/On duty/Leave), plus a filterable OD report with CSV export — the same shape as Phase 3's student attendance, applied to staff.
- **Payroll**: salary components (Earning/Deduction, organization-scoped like Fee Components), a per-staff salary structure grid, and monthly payslip generation that snapshots the structure into a `Payslip.breakdown` JSON field — like a fee receipt, so a later salary-structure edit never rewrites past payroll history. Payslips are printable.
- **Transport**: Vehicles (branch-scoped CRUD) and Routes & Stops, where a route's stops are edited as a dynamic per-row list (create/update/delete-diffed in one transaction, the same pattern as Exam↔ExamSubject from Phase 4). Deleting a stop or route is blocked with a friendly error if a student is still assigned to it, rather than a raw FK-constraint 500.
- **Hostel**: Hostels (buildings, with an optional warden) and Rooms, with occupancy counts. Room capacity is enforced at assignment time (can't over-allot a room) and deletion is blocked while any student is still allotted.
- **Student ↔ Transport/Hostel assignment lives on the Student Master detail page**, not as a separate bulk-mover screen — a compact "Transport" and "Hostel" card (visible only with `transport.routes`/`hostel.manage` EDIT permission) lets an admin assign one student to a route stop or hostel room, matching how `Section` assignment already lives directly on the `Student` record rather than a parallel assignment table.

## What's built (Phase 2 adds)

- **Sections**: CRUD mapping a course to a branch/academic year, with an optional class teacher and capacity.
- **Student Master**: search/filter by course/section, full profile view + edit, photo upload, guardian linking (search-by-phone-or-create), mark-as-left.
- **Bulk Upload**: CSV import with a downloadable template; every row is validated before any write, rejected rows are reported with a reason, accepted rows are still created.
- **Promote** and **Section Change**: pick a source section, review/deselect the roster, pick a target section, confirm — both write an `AuditLog` entry with the affected student IDs.
- **Strength / Abstract reports**: section-wise and course-wise headcount summaries, exportable.
- **Outgoing Students**: students marked "left"; outstanding-dues column is a placeholder until Finance (Phase 6) ships.
- **Trash**: soft-deleted students with one-click restore.
- **ID Cards**: select a section's roster, generate a print-ready card layout (browser print, `@media print` hides app chrome).
- **Certificate Permission**: bulk-toggle `tcEligible` ahead of Transfer Certificate issuance (Phase 7).
- **Birthday List**: today's birthdays (computed in Postgres via `CURRENT_DATE`, not app-server time, to avoid timezone drift) with a stubbed "Send Wishes" SMS action.
- **App Home Banners**: image CRUD for the Student/Parent portal home feed, served through a small local-storage route handler (`/uploads/[...path]`) that stands in for the swappable `StorageProvider`.
- **Admin dashboard**: now includes active-student/section counts and an enrollment-by-course bar chart built on the shared `<ChartContainer>`.

## What's built (Phase 3 adds)

- **Attendance**: classwise bulk-mark flow (per-student radio group defaulting to Present, absentee sub-list updates immediately on save, no page reload needed), markable for any past or future date, shared between the Admin and Teacher portals. An Admin-only Absentee Report filters by multi-section + date range with CSV export.
- **Timetable**: a Monday–Saturday × 8-period grid per section; click a cell to set its subject/teacher or clear it. Shared between Admin and Teacher.
- **New dual-role authorization pattern**: `requireSectionActionAccess()` in `lib/rbac/scope.ts` — the first RBAC helper usable by both Admin (module-permission-scoped) and Teacher (row-scoped: only sections they're the class teacher of) on the *same* mutation. Everywhere else, `requirePermission()` (Admin-only) and row-scope helpers stayed separate; attendance/timetable needed both at once, so this composes them rather than special-casing role checks inline in every action.
- **Teacher dashboard** now shows today's per-section attendance status (marked/not marked) with a one-click link into the mark-attendance flow for anything still outstanding.

## What's built (Phase 4 adds)

- **Courses & Subjects master data screen** — a gap from Phase 1/2 (both existed only as seed data with no admin UI) fixed now because Exams genuinely needs a manageable subject list.
- **Syllabus, School Calendar, Monthly Lesson Plans**: section/subject-scoped CRUD (Syllabus, Lesson Plans) and a branch-wide school calendar, all shared between Admin and Teacher via the new `requireBranchActionAccess()` helper (the branch-wide sibling of Phase 3's `requireSectionActionAccess()` — for screens with no single "owning section," e.g. any teacher at the branch may post a calendar event, not just class teachers).
- **Exams & Assessments, full pipeline**: Exam Types → Exams (with a dynamic per-subject max-marks/pass-marks/exam-date editor) → subject-filtered Marks Entry (shared Admin/Teacher, optional "send SMS on save" via the stub `NotificationProvider`) → Hall Tickets and Progress Reports (printable, `@media print` layouts) → Result Reports (exam × section, computed rank, CSV export) → Competitive Exam Marks (Admin-only, with delete).
- **Rank calculation is a pure, unit-tested function** (`computeRanks()` in `server/services/exam-rank.ts`) implementing standard "1224" competition ranking (ties share a rank, the next rank skips ahead) — the spec's explicit "core business logic needs unit tests" requirement.
- **Marks-entry validation is server-enforced**: a mark exceeding an exam subject's max marks is rejected with a clear error, not silently clamped or accepted.

## What's built (Phase 5 adds)

- **Homework, with the student submission flow the spec calls out as new**: Admin/Teacher post per section/subject (with file attachments), a submission-tracking view shows who has/hasn't submitted, Students view and submit (or resubmit) from their own portal, Parent gets a read-only view per linked child. Submissions are automatically flagged late server-side by comparing to the due date at submit time.
- **Notifications**: targeted to everyone in a branch (Admin only), a section, or one student — Student/Parent get an in-app feed.
- **Circulars**: school-wide or section-targeted notices, surfaced to Student/Parent as "Messages" per the spec's relabeling.
- **Gallery & Videos**: branch-scoped albums/photos and video links, manageable by Admin/Teacher, visible to everyone including Student/Parent.
- **Chat**: one persistent thread per student, shared by all of that student's guardians, the student themself, and any staff with access (their class teacher or any Admin) — not a private 1:1 channel per participant pair.
- **Bulk SMS**: Admin-only, permission-gated (`comms.sms`), targeted at all guardians in a branch or all guardians in one course, routed through the stub `NotificationProvider`. Follows the confirm-then-audit-log pattern required for bulk sends (Section 9).
- **Every Communication feature ships to all four portals in this phase** (not deferred to Phase 9 like other modules' Student/Parent views) — the spec explicitly calls this out for 6.9, unlike Attendance/Exams/Timetable where Student/Parent views are Phase 9 work.

## What's built (Phase 6 adds)

- **Fee Structure**: fee components (categorized Tuition/Transport/Hostel/Books/Uniform/Other) mapped to branch × course × academic year with per-component amounts, editable as one grid save.
- **Fee Ledger & Receipts**: record a payment against a student, auto-generated sequential receipt number (`RCPT-{year}-{seq}`), a printable fee slip, and receipt cancellation — confirm + reason + audit log, per Section 9's destructive-financial-action requirement.
- **Fee Due Report** and **Fee Due SMS**: outstanding-balance summary per student, with a confirm-then-audit-logged bulk SMS reminder to guardians with a balance.
- **Expenditure** and **Banking**: both follow the cancel-not-delete pattern from Section 5 — a cancelled sub-list stays visible with its reason, nothing is hard-deleted.
- **Finance Reports**: daily collection, cashier/collector-wise, daily cashbook (running balance across receipts/expenses/bank transactions), income projection (structure due × active headcount vs. actually collected, by course), monthly collection summary, and other-fee-type breakdown — one reports page, not six duplicated ones.
- **Fee calculation is a pure, unit-tested function** (`computeFeeDue()` in `server/services/fee-calculations.ts`) — the spec's other explicitly-called-out "core business logic needs tests" item alongside rank calculation. It's deliberately written so cancelled receipts can never count toward "paid."
- **Student/Parent get a read-only fee-status view** on their dashboard: a paid-vs-balance bar chart on the shared `<ChartContainer>` (with its accessible table fallback), plus a status badge.
- **Bug found and fixed this phase, then swept across the whole codebase**: several "quick add" actions (fee components, exam types, courses, subjects, academic years, permission profiles) called `db.model.create()` directly against a uniquely-constrained field with no pre-check, so submitting a duplicate name crashed with an unhandled 500 instead of a friendly validation error. Caught by an automated re-run of a QA script that happened to submit the same name twice; fixed in all six places, not just the one that surfaced it.

## What's built (Phase 1)

- **Auth**: custom database-backed sessions (bcrypt hashing, httpOnly cookies, in-memory login rate limiting, instant force-logout on account deactivation/password reset).
- **RBAC**: `Role` (Admin/Teacher/Student/Parent) + `PermissionProfile` system so admins can create scoped staff roles (e.g. "Front Office", "Finance Staff") without new top-level roles. Enforced server-side on every server action and route handler — never just hidden in the UI.
- **System Setup**: Academic Years (with per-branch "current year"), Organizations, Branches — full CRUD, search, sort, pagination, CSV export, soft delete where applicable.
- **Users & Roles**: admin account creation/deactivation/password reset, and a permission-profile editor with a module × action grant grid.
- **Shared infrastructure other phases will reuse**: server-paginated `<DataTable>`, accessible `<FormField>` pattern, `<ChartContainer>` with a guaranteed-present mount point and always-available table fallback, `AuditLog` service (wired into every destructive action so far), pluggable `NotificationProvider` (logs to console in dev) and `StorageProvider` (local disk in dev) interfaces.
- **All four portal shells**: Admin/Teacher are dense desktop layouts; Student/Parent are mobile-first, card-based, bottom-nav layouts with a PWA manifest. Every nav item currently shown loads real, seeded data — no empty/broken screens (per the spec's explicit pitfall list).
- **Accessibility groundwork**: skip-to-content link, visible focus rings, semantic table markup with sortable-column `aria-sort`, status conveyed via icon + text (never color alone), programmatically-associated form labels/errors on every form.

## Deliberate scope decisions for this phase

- **Prisma pinned to v6.19.2, TanStack Table pinned to v8.21.3** (not the `latest` npm tags, which resolved to Prisma 7 and TanStack Table v9 — both released after this assistant's training cutoff). Pinning to the last version I have confident, verified knowledge of was judged safer than guessing at a brand-new major's API for foundational infrastructure. Revisit this once those majors are well-documented.
- **User Accounts (Users & Roles) only creates standalone Admin accounts in Phase 1.** Generating Teacher/Student/Parent logins "from their master record" (per spec) needs those master-data screens, which ship in Phase 2 (students) and Phase 8 (staff). The seed script creates Teacher/Student/Parent `User` rows directly to make all four portals demo-able now.
- **The "SMS-sending permission" toggle** from the spec is implemented as an ordinary `comms.sms` module grant in the permission-profile system, rather than a bespoke separate toggle — it's the same mechanism, so a special case wasn't needed.
- **Branch isolation**: an Admin `User` has an optional `branchId`; `null` means org-wide (multi-branch) access, matching the spec's multi-branch requirement from day one even though the seed data has a single branch.
- **No real crest/logo image assets were supplied**, so the PWA icon and login-page mark are a placeholder "SS" monogram in the brand palette (royal blue / gold). Swap `public/icon.svg` and the mark in `src/app/login/page.tsx` for the real crest when available.
- **Migrations in this sandboxed dev environment**: `prisma migrate dev` refuses to run non-interactively once a migration needs a confirmation prompt. See the workaround documented in `ARCHITECTURE.md` §7 — it produces an identical, real migration file, just via non-interactive steps. Unaffected in a normal terminal.
- **ID Cards ship with one built-in template** rather than a template-management screen — the spec's "choose a card template/layout" is satisfied minimally; a template editor is a v2 follow-up if the school needs more than one layout.
- **Outgoing Students' "outstanding dues" column is a visible placeholder**, not a fabricated number — real figures need `FeeTransaction` data from Phase 6.
- **`Student.leftDate`/`leftReason` were added** (beyond the Section 5 minimum) because the Outgoing Students report needs them to be meaningful; a bare `status = LEFT` with no timestamp wasn't enough to build a real report against.
- **"A teacher's section" means class-teacher-of, for now.** There's no separate per-subject teaching-assignment model yet, so Attendance/Timetable scope a Teacher to sections where `Section.classTeacherId` matches them. A subject-teacher (who isn't a class teacher) can't yet mark attendance or edit a timetable for a section they only teach one subject in — revisit if/when a `TeachingAssignment` model is introduced for marks entry in Phase 4.
- **Attendance is one status per student per calendar day**, not per period — matches how the spec describes daily attendance marking (6.6) rather than per-period attendance.
- **Hall Ticket fee-verification gating is not yet enforced.** The spec requires blocking generation until fees are sufficiently paid; that data doesn't exist until Finance (Phase 6). The screen says so explicitly rather than silently pretending the check passed. The `HALL_TICKET_FEE_THRESHOLD_PERCENT` env var from Phase 1 is still the intended config point once it's wired up.
- **`ExamMark` is normalized through `ExamSubject`** (exam × subject → maxMarks/passMarks/examDate) rather than storing maxMarks redundantly on every mark row as Section 5's literal field list suggests — one row per exam+subject instead of duplicating the max across every student's mark, which also gives the "Exam Timetable" per-subject date for free.
- **Competitive Exam Marks' student picker lists all active students** (capped at 500) rather than a type-ahead search — fine at this school's scale; revisit with a real search endpoint if a deployment has thousands of active students.
- **Student/Parent mobile bottom nav stays at 4 items** (Home, Homework, Messages, Profile) rather than growing one tab per new module — Notifications/Gallery/Videos/Chat are reachable as quick-link cards on the Home dashboard instead, matching the spec's own description of the Phase 9 parent home ("quick links into ... plus a recent-notifications feed") rather than overloading the tab bar.
- **Chat has no admin/teacher search-by-name** beyond the plain student list scoped to their sections/branch — fine at this scale, would want pagination/search for a larger deployment.
- **`FeeTransaction` holds one total amount per receipt**, not a per-fee-component line-item breakdown — matches Section 5's literal field list ("student, amount, date, mode, receipt number, cancelled flag + reason") rather than the more normalized design I used for `ExamMark`/`ExamSubject`; a receipt here is what it pays for in total, not itemized.
- **Receipt numbers are generated by counting existing rows per branch**, not a DB sequence — correct at this school's transaction volume/concurrency, but two receipts created in the same instant on the same branch could theoretically race; a real production deployment would want a DB-level sequence or advisory lock.
- **Finance module is Admin-only** (permission-profile-scoped, e.g. a "Finance Staff" role from Phase 1's seed) — unlike Attendance/Timetable/Exams/Communication, Finance has no Teacher-facing screens, matching how the spec frames Section 6.10 as an Admin/finance-staff module throughout.

- **`AdmissionEnquiry` is one model with a status-pipeline enum, not two parallel "Enquiry" and "Application" models** as the spec's section headings might suggest. "Applications" is a filtered view (`APPLIED`+`ADMITTED`) of the same kanban board component as the full "Enquiries" pipeline — an application is just an enquiry that reached a later stage, not a distinct entity with its own lifecycle.
- **Transfer Certificates are Admin-only** (permission-profile-scoped, e.g. the seeded "Front Office" role) — there's no teacher-facing TC screen, matching how the spec frames certificate issuance as a front-office/admin function throughout.
- **CBSE Bulk Upload updates existing students only.** It's explicitly a backfill step ahead of TC printing (father/mother name, nationality, category weren't captured at admission time in earlier phases), not a general-purpose student importer — that's Phase 2's Bulk Upload, which does create new students.
- **"Generate Login" only ever creates a `TEACHER`-role user.** The `Role` enum has no generic "staff" role, and a non-teaching staff member (accountant, office assistant, driver) has no portal to log into — their `StaffMember` record exists purely for HR/payroll purposes. This matches the seed data, which adds two non-teaching staff with no linked `User`.
- **Staff Attendance / OD is a single daily status per staff member** (Present/Absent/Half day/On duty/Leave), not a separate leave-type-and-quota system with a request/approval workflow. The module's own spec-declared name ("Staff Attendance / OD") reads as a combined attendance+exception register, not full HR leave management, so a request/approval flow was judged out of scope for this phase.
- **Payroll has no statutory deduction calculators** (PF/ESI/TDS slabs, etc.) — `SalaryComponent` is a flat named amount an admin enters directly (same simplicity as Fee Components), not a rules engine. A school this size can model PF/HRA as ordinary components with admin-entered amounts.
- **Transport and Hostel assignment is one student at a time**, from the student's own profile page, not a bulk-mover screen (unlike Section Change/Promote, which are inherently bulk operations spanning whole classes). Whether a given student rides the bus or lives in the hostel is comparatively rare to change and usually decided per-family, not per-cohort.
- **Route/Room deletion and stop removal are guarded against orphaning a live assignment** (blocked with a friendly error, not a raw foreign-key 500) — the same anti-pattern fix applied proactively here that Phase 6 discovered reactively for duplicate-name crashes.
- **Vehicles and Routes use a simple in-page list instead of the paginated `<DataTable>`** — at this school's scale (a handful of buses/routes, not hundreds), a full server-paginated table would be overhead without benefit; Staff Master kept `<DataTable>` since a school's total staff count is comparable to its student count.
- **No dedicated Staff ID Card screen shipped this phase.** It wasn't one of the module keys scoped for Staff/HR (`hr.staff`, `hr.payroll`, `hr.attendance`) during Phase 1 planning; Phase 2's Student ID Cards print layout could be extended to staff in a v2 follow-up if needed.

## Open follow-ups for v2 (beyond later-phase feature work)

- Real SMS/push vendor behind the existing `NotificationProvider` interface.
- Object storage (S3-compatible) behind the existing `StorageProvider` interface, in place of local disk.
- Shared rate-limit store (e.g. Redis) if deployed across multiple instances — the current login rate limiter is in-memory, single-instance.
- Student contact-detail self-service edits are applied immediately rather than routed through an approval queue; the spec allows either, and immediate application was chosen to avoid building an approval workflow before there's anything else to approve.
- Real crest/logo image assets in place of the placeholder monogram.
