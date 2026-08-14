# SSSVM School Management System

A PowerSchool-style school management system for **Sree Siva Shankar Vidya Mandir** (K.R.M. Colony) — four portals (Admin, Teacher, Student, Parent) on one Next.js app, one PostgreSQL database, and one Prisma schema. See `ARCHITECTURE.md` for the full stack rationale and design decisions.

## Status: Phase 5 of 10 (Communication)

This build follows the phased plan in `ARCHITECTURE.md` §8 / the original spec's Section 12. **Phases 1–5 are complete and demo-able**: project scaffold, auth, RBAC, the shared data-table component, System Setup, Users & Roles, Sections, the full Student Information System core, Attendance + Timetable, Exams & Assessments, Syllabus/Schedule/Lesson Plans, and now the full Communication module (Homework with student submission, Notifications, Circulars, Gallery, Videos, Chat, Bulk SMS) across **all four portals**. Phases 6–10 (Finance, Admissions/Certificates, HR/Transport/Hostel, the rest of the Student/Parent portals' feature set, and the accessibility/security hardening pass) are not yet built — see `ARCHITECTURE.md` for the build order.

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

## Open follow-ups for v2 (beyond later-phase feature work)

- Real SMS/push vendor behind the existing `NotificationProvider` interface.
- Object storage (S3-compatible) behind the existing `StorageProvider` interface, in place of local disk.
- Shared rate-limit store (e.g. Redis) if deployed across multiple instances — the current login rate limiter is in-memory, single-instance.
- Student contact-detail self-service edits are applied immediately rather than routed through an approval queue; the spec allows either, and immediate application was chosen to avoid building an approval workflow before there's anything else to approve.
- Real crest/logo image assets in place of the placeholder monogram.
