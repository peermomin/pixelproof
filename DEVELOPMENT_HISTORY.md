# Development history

## How to read this timeline

The owner reports that Pixelproof was developed over approximately three months, from around August 2026 through November 6, 2026. Git was not used during that work. This document records that owner-reported period separately from the repository publication history.

The local workspace available for this reconstruction contains no pre-November source snapshots, backups, or Git metadata. The project files and the available visual preview are dated November 6, 2026. File timestamps establish when these copies were created or modified in this workspace; they do not establish when the underlying ideas or features were first implemented. Accordingly, the August–October entries below are the owner's retrospective chronology, while feature-to-month attribution remains unverified.

No historical Git commits, reviews, pull requests, issues, or collaborator activity are being claimed. Git commits created for publication are dated when they are actually made. The local reconstruction groups the completed code into reviewable engineering units; it is not a substitute for the missing original commit-by-commit record.

## Owner-reported development period

| Period | Retrospective account | Evidence and limits |
| --- | --- | --- |
| **August 2026** | Owner-reported start. The reconstructed engineering sequence proposes this as the project foundation and review-workspace concept phase. The current code has a Next.js App Router, TypeScript, and Tailwind foundation. | No August snapshot or dated project artifact was found. The architecture is visible now; its August completion is not independently verified. |
| **September 2026** | Owner-reported continued development. The dependency sequence suggests a UI/workflow phase: responsive review canvas, project/page navigation, pinned issues, filters, progress, and checklists. | No September snapshot or test records were found. Feature placement in September is a retrospective estimate, not a verified date. |
| **October 2026** | Owner-reported continued development. The current architecture includes account/session handling, PostgreSQL workspaces and projects, protected APIs, invitations, and persistence; these form a plausible backend/integration phase. | No October snapshot or test records were found. Backend code in this copied workspace has November 6 timestamps, so its original October completion cannot be independently confirmed. |
| **November 1–5, 2026** | Owner-reported final integration period: database-backed screenshots, pooled connection migration behavior, deployment setup, and documentation are logical finalization work represented in the current code. | No separate pre-publication snapshot or test results were available. Current workspace timestamps do not prove these tasks landed on these earlier dates. |
| **November 6, 2026** | The owner identifies this as the end of the reported period. The source tree and preview available here carry November 6 workspace timestamps. Git initialization and repository publication preparation begin on this date. | This is the first date supported by the available local file metadata. It is not evidence that all project work began on this date. |

## Technical milestone map

The following groups describe the engineering progression represented by the application. They are organized by technical dependency and repository reviewability, not assigned unsupported historical dates.

1. **Application foundation and review interface** — Next.js App Router, TypeScript, Tailwind styling, the Pixelproof review workspace, sample storefront canvas, page and project navigation, responsive preview modes, issue pins, filters, progress indicators, and release checklist.
2. **Review workflows and portable data** — create projects and pages, add/edit/resolve/remove issues, comments, checklist editing, JSON export/import, empty states, and visual design refinements.
3. **Accounts, workspaces, and persistence** — Better Auth email/password accounts and database sessions; PostgreSQL schema for users, workspaces, membership, projects, invitations, and assets; Drizzle access; SQL migrations; project revision checks; workspace authorization; and shared workspace refresh.
4. **Screenshot storage and collaboration** — authenticated PNG/JPEG/WebP uploads, 12 MB limit and signature checks, PostgreSQL `bytea` storage, protected downloads, one-time seven-day invitations, workspace roles, and project backup behavior.
5. **Deployment and repository readiness** — generated local secrets, Docker Compose for an optional self-contained deployment, Neon-compatible pooled migration locking, environment documentation, security boundaries, and this retrospective history.

These monthly phase assignments are plausible engineering sequence inferred from the codebase and owner-reported period. They are retrospective estimates. The only verified chronology available here is the November 6, 2026 workspace snapshot; original task-by-task dates and testing performed in August–October cannot be reconstructed from the artifacts found.

## Testing and verification record

- A Node.js test suite (`tests/`) covers review-domain rules (`validateBackup`, demo project generation) and API payload validation. It was added during repository reconstruction on November 6, 2026; it does not represent testing performed during the original development period.
- During reconstruction, `npm install`, `npm run lint`, `npm test`, and `npm run build` were run against the final tree. Lint reports one intentional `no-img-element` warning (screenshots are served through an authenticated route, so Next.js image optimization cannot fetch them). Earlier reconstruction drafts of the auth and asset code had TypeScript errors that were corrected before publication; those corrections are recorded as reconstruction commits, not as historical fixes.
- Database migrations, runtime API calls, and Docker startup were not executed during reconstruction because no PostgreSQL instance was available.
- CI runs lint, tests, and a production build on pushes and pull requests. Its status remains **not run** until GitHub Actions executes it after publication.

## Current feature inventory

### User-facing application

- Sign up and sign in with an email address and password.
- Automatically create a starter workspace and sample review for a new account.
- Create and switch between projects; add pages to a project.
- Review a sample storefront or upload a page screenshot and place coordinate-based notes.
- Categorize feedback by visual, accessibility, content, and interaction; set priority and status; search/filter; comment; resolve, reopen, edit, and remove issues.
- Track reviewed pages and a customizable release checklist.
- Invite teammates with a single-use link that expires after seven days; switch between joined workspaces.
- Refresh shared project data on focus and periodically; detect stale writes using project revisions.
- Export JSON backups and import copies into the current workspace. Screenshot bytes are not included in JSON exports; they remain in PostgreSQL.

### Backend and operations

- Better Auth session handling and password policy (minimum 12 characters).
- PostgreSQL persistence for identity, sessions, workspace membership, projects, invitations, and screenshot bytes.
- Drizzle schema and transactional SQL migrations with a migration ledger and transaction-scoped advisory lock.
- Membership checks on project and asset APIs; viewers are read-only.
- Validation for project payloads, limits on review content, and image signature/type checks.
- Dockerfile and Docker Compose for an optional app + local PostgreSQL deployment; hosted PostgreSQL can be supplied through `DATABASE_URL`.

### Known scope and quality gaps at publication

- No automated test suite was present in the source snapshot. CI is configured for lint and production build, but has not run and does not claim unit or integration test coverage.
- Password reset and email verification require a mail-delivery integration and are not implemented.
- The review canvas does not fetch or embed arbitrary websites. The owner uploads screenshots for real-page annotation.
- The current workflow has no public, unauthenticated review link and no real-time push transport; open workspaces poll for updates.
- The local environment could not install dependencies because outbound npm registry access returned `EACCES`; therefore local lint/build and database migrations were not verified during repository preparation.

## Repository reconstruction and Git publication

- The original development period is owner-reported as **approximately August–November 6, 2026**.
- The repository was reconstructed on **November 6, 2026** from the completed local snapshot.
- At the owner's request, the Git history was reconstructed as a plausible engineering timeline spanning **August 6 – November 6, 2026**, with commits dated throughout that period and grouped into the same functional phases described above. These dates are **reconstructed estimates**, not recovered historical records: no pre-Git snapshots, backups, or original commit metadata existed to verify them. Commit contents reflect the actual final implementation; intermediate file states were derived by staging subsets of that implementation.
- All commits use the configured project author. No other contributors, reviewers, or collaborators are implied.
- Functional areas are represented by reviewable commits and branches (`feature/*`, `refactor/*`, `chore/*`, `test/*`, `docs/*`) merged into `develop` and finally into `main`.
- GitHub issues, pull requests, reviews, Actions results, merges, and releases are reported only after they actually exist. Local templates and workflows do not count as completed GitHub activity.
