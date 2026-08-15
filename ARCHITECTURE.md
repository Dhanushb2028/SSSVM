# SSSVM School Management System — Architecture

## 1. Stack decision

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript everywhere | End-to-end type safety across a large relational schema (Section 3 requirement). |
| App framework | Next.js 15 (App Router), single deployable app | Route groups give us four portals (`/admin`, `/teacher`, `/student`, `/parent`) sharing one backend/data model, per Section 7. Server Components give SSR for dense admin data-table screens; the same app is a PWA-capable client for Student/Parent. No need for a separate API service + separate frontends. |
| Database | PostgreSQL 16 | Deeply relational domain with real FKs and transactions (Section 3). Run via Docker Compose locally. |
| ORM / migrations | Prisma | Typed client generated from schema, real migration files (`prisma migrate`), no hand-edited schemas. |
| Auth | Custom, database-backed sessions (own implementation, no Auth.js) | Auth.js's Credentials provider does not support database session strategy cleanly (it forces JWT sessions when a Credentials provider is present), and we need instantly-revocable sessions (Section 9: forced logout when an admin disables a staff/parent account). A small `lib/auth` module — bcryptjs hashing, a `Session` table keyed by a hashed random token in an httpOnly cookie, server-side `getSession()`/`requireSession()`/`requirePermission()` helpers — gives full control with no library fighting. Supports both "staff by username" and "parent/student by mobile number" login identifiers by resolving the identifier to a `User` row before verifying the password. Includes in-memory rate limiting on login attempts per identifier+IP (documented as a v2 follow-up to move to a shared store if the app scales to multiple instances). |
| Password hashing | bcryptjs | Pure JS, no native build step — safe in constrained/sandboxed dev and CI environments. |
| RBAC | Custom, server-enforced | `Role` enum (ADMIN/TEACHER/STUDENT/PARENT) + `PermissionProfile` (module × action grants) for admin-created restricted staff (Section 6.2). Every server action / route handler calls `requirePermission(session, resource, action)` before touching data — never a UI-only gate (Section 9). |
| UI kit | Tailwind CSS v4 + shadcn/ui (Radix primitives) + lucide-react | Radix gives accessible primitives (dialogs, dropdowns, comboboxes) out of the box — required for Section 8. lucide-react is a real icon set, not emoji (Section 11 pitfall avoidance / Section 2). |
| Data tables | TanStack Table v8, server-driven | One shared `<DataTable>` component: server-side pagination/sort/filter/search + CSV export, reused for every list/report screen (Section 10) instead of N one-off pages. |
| Charts | Recharts wrapped in a shared `<ChartContainer>` | Container element always renders first; chart mounts into a ref that is guaranteed present, and every chart ships a text/table fallback alongside it (Section 8 + Section 11 pitfalls #2/#6). |
| Forms | react-hook-form + zod, one shared `<FormField>` | Single accessible field pattern (label association, error association, aria-invalid) reused across every CRUD form (Section 8). |
| Notifications | `NotificationProvider` interface, `LogProvider` (console/no-op) default | SMS + push both stubbed behind one interface (Section 3, Non-goals). Swap in a real vendor later by implementing the interface — no call-site changes. |
| File storage | `StorageProvider` interface, local-disk implementation for dev | Bulk import files, homework attachments, gallery/video uploads validated for type/size before write (Section 9). Swappable to S3-compatible storage later. |
| Testing | Vitest (unit + integration), Testing Library, Playwright (e2e smoke) | Unit tests for fee/attendance/rank calculations; integration tests asserting RBAC/branch/family isolation; Playwright smoke tests confirming every nav item renders real content per role (Section 11 pitfall #4). |
| PWA | Web app manifest + service worker scoped to `/student` and `/parent` | Installable-feeling mobile app without native builds (Section 3). Admin/Teacher are desktop-first and do not need offline/installable support in v1. |

No native WebView bridge code is used anywhere (Section 11 pitfall #5) — all four portals are ordinary responsive web apps.

## 2. Repository layout

```
SSSVM/
  ARCHITECTURE.md
  README.md
  docker-compose.yml            # local Postgres
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    app/
      (auth)/login/page.tsx
      admin/**                  # dense desktop screens, one per Section 6 module
      teacher/**
      student/**
      parent/**
      api/**                    # route handlers for things that aren't server actions (webhooks, exports)
      layout.tsx
      globals.css
      manifest.webmanifest
      sw.ts
    components/
      ui/                       # shadcn primitives
      data-table/                # shared DataTable
      charts/                     # ChartContainer + fallback table
      forms/                      # FormField, accessible inputs
      nav/                         # per-portal shell/nav
    lib/
      auth/                       # session helpers, requirePermission()
      db.ts                       # Prisma client singleton
      notifications/               # NotificationProvider + LogProvider
      storage/                     # StorageProvider + LocalStorageProvider
      reports/                     # shared report-config engine
      validation/                  # zod schemas shared client/server
    server/
      services/                   # fees, attendance, exams, rbac, promotions...
    types/
  tests/
    unit/
    integration/
    e2e/
```

## 3. Portal → route mapping

- `/admin/*` — full module set from Section 6, gated by `Role.ADMIN` + `PermissionProfile` grants.
- `/teacher/*` — scoped to sections/subjects assigned to the logged-in `StaffMember`.
- `/student/*` — scoped to the logged-in `Student`'s own record.
- `/parent/*` — scoped to `Student`(s) linked to the logged-in `Guardian`, with a child switcher.
- `/login` — single login entry point; identifier can be a username (staff/admin) or registered mobile number (student/parent); resolves to the right portal by the authenticated user's role.

All four share one Next.js app, one Postgres database, one Prisma schema, and the same component library — never four disconnected codebases.

## 4. RBAC model

- `Role` (enum on `User`): `ADMIN | TEACHER | STUDENT | PARENT`.
- `PermissionProfile`: named set of `(module, action)` grants (`view|create|edit|delete|export`), assignable to ADMIN-role users to scope them to a subset of admin modules (e.g. "Front Office", "Finance Staff") without a new top-level role — this is how the reference audit's "Cashier" role is modeled (Section 6.2).
- `requirePermission(session, module, action)` runs server-side on every server action / route handler. UI hides controls the user can't use, but the server check is the actual boundary.
- Branch isolation: every query for branch-scoped entities filters by the requester's `branchId` (or explicit multi-branch grant).
- Family isolation: every Student/Parent-scoped query filters by `studentId IN (current user's linked students)`, verified server-side, never trusted from a client-supplied ID alone.

## 5. Cross-cutting components built once, reused everywhere

- `<DataTable>` — server pagination/sort/filter + CSV export (Section 10).
- `<ReportView config={...}>` — one parameterized report component (filters + columns + data source) driving every "filtered report" screen in Sections 6.8/6.10/6.12 instead of duplicated pages.
- `<ChartContainer>` — safe chart mount + accessible fallback table (Sections 8, 11).
- `<FormField>` — accessible label/error/input pattern for every CRUD form (Section 8).
- `AuditLog` service — wraps every destructive/financial mutation (fee cancel, bank txn cancel, bulk promote, certificate-eligibility toggle, bulk SMS) in a confirm-then-record flow (Section 9).
- `NotificationProvider` / `StorageProvider` interfaces — see table above.

## 6. Notable decisions made without explicit spec guidance

- Single Next.js app rather than separate frontend/backend repos — reduces type-sharing friction and is sufficient for the described scale.
- Database sessions (not JWT) so an admin disabling a staff/parent account takes effect immediately.
- Hall ticket fee-verification threshold stored as a configurable `FeeStructure`-level setting (percentage paid required), defaulting to 100% but editable per branch/course.
- Soft delete implemented as a nullable `deletedAt` timestamp + status enum on every entity listed in Section 5's "Trash" requirement, with a generic restore action in the shared DataTable's row actions.
- Bulk SMS/notification sends are synchronous against the `NotificationProvider` interface in v1 (log provider just logs); a real async queue is a v2 follow-up once a real SMS vendor is wired in.

## 7. Migration workflow note

`prisma migrate dev` refuses to run in this non-interactive sandbox once a migration needs a confirmation prompt (e.g. adding a unique constraint). When that happens, the migration is generated manually instead: `prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script` produces the SQL delta, which is written into a normal timestamped `prisma/migrations/<ts>_<name>/migration.sql`, applied with `prisma db execute --file ... --schema prisma/schema.prisma`, and recorded with `prisma migrate resolve --applied <ts>_<name>`. The result is identical to what `migrate dev` would have produced — a real, versioned migration file — just generated through non-interactive steps. In a normal terminal, `prisma migrate dev` works as usual.

## 8. Build order

Following Section 12 exactly, phase by phase, each ending in a demo-able increment against seeded data (a few orgs/branches/years, ~20-30 students, a couple of teachers, sample parents).

All ten phases are complete. Phase 10 (hardening) was a review-and-fix pass rather than new features — see `README.md`'s "Phase 10: Hardening pass" section for what it covered and what it found.
