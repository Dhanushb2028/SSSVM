# SSSVM School Management System

A PowerSchool-style school management system for **Sree Siva Shankar Vidya Mandir** (K.R.M. Colony) — four portals (Admin, Teacher, Student, Parent) on one Next.js app, one PostgreSQL database, and one Prisma schema. See `ARCHITECTURE.md` for the full stack rationale and design decisions.

## Status: Phase 2 of 10 (Student Information System core)

This build follows the phased plan in `ARCHITECTURE.md` §8 / the original spec's Section 12. **Phases 1–2 are complete and demo-able**: project scaffold, auth, RBAC, the shared data-table component, System Setup, Users & Roles, Sections, and the full Student Information System core (student master data, bulk upload, promote, section change, trash, ID cards, certificate permission, birthday list, app banners). Phases 3–10 (Attendance/Timetable, Exams, Communication, Finance, Admissions/Certificates, HR/Transport/Hostel, the Student/Parent portals' full feature set, and the accessibility/security hardening pass) are not yet built — see `ARCHITECTURE.md` for the build order.

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

## Open follow-ups for v2 (beyond later-phase feature work)

- Real SMS/push vendor behind the existing `NotificationProvider` interface.
- Object storage (S3-compatible) behind the existing `StorageProvider` interface, in place of local disk.
- Shared rate-limit store (e.g. Redis) if deployed across multiple instances — the current login rate limiter is in-memory, single-instance.
- Student contact-detail self-service edits are applied immediately rather than routed through an approval queue; the spec allows either, and immediate application was chosen to avoid building an approval workflow before there's anything else to approve.
- Real crest/logo image assets in place of the placeholder monogram.
