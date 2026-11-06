# Architecture

Pixelproof is a self-hosted visual QA workspace: reviewers sign in, open a
project, pin feedback to page screenshots, and work through a release
checklist. PostgreSQL is the single source of truth for identity, workspace
data, and image bytes.

## Layers

```
src/app/page.tsx          Client SPA surface ("use client")
src/components/           Presentational UI extracted from the page
src/app/api/**            Next.js route handlers (HTTP boundary)
src/lib/server.ts         Session, workspace, and membership helpers
src/lib/validation.ts     Zod payload schemas for API input
src/lib/pixelproof.ts     Review domain types, demo data, backup rules
src/lib/auth*.ts          Better Auth server/client configuration
src/db/                   Drizzle schema + lazy pg Pool
scripts/migrate.mjs       Versioned SQL migration runner
drizzle/                  Ordered .sql migrations + ledger
```

Dependency direction is one-way: `app → components/lib → db`. Route
handlers never render UI; components never import `src/db` directly.

## Request flow

1. Browser calls a route handler (e.g. `PUT /api/projects/:id`) with the
   session cookie.
2. `requireUser()` resolves the Better Auth session; `workspaceRole()`
   checks membership on the target workspace. Viewers are read-only.
3. Input is validated (`projectPayloadSchema`, image signature checks).
4. Writes go through Drizzle inside a transaction; project saves carry an
   `expectedRevision` and return `409 Conflict` on stale writes.
5. Responses are JSON; screenshot bytes stream from `bytea` via
   `/api/assets/:id` with `nosniff` headers.

## Data model

- `user`, `session`, `account`, `verification` — Better Auth tables.
- `workspaces`, `workspace_members` — tenancy and roles (`owner`, `editor`,
  `viewer`).
- `projects` — metadata columns plus a JSONB `data` document
  (`pages`, `issues`, `checklist`) and a monotonic `revision`.
- `invitations` — SHA-256 token hashes, 7-day expiry, single use.
- `review_assets` — screenshot metadata + `bytea` content.

## Trust boundaries

- Authentication is enforced per request; there are no public project routes.
- Every project/asset/invitation query is scoped by `workspaceId` after a
  membership check — never trust client-supplied workspace IDs alone.
- Invite tokens are bearer secrets stored only as hashes.
- Uploads are limited to PNG/JPEG/WebP by magic bytes and 12 MB.

## Operational notes

- Migrations run via `scripts/migrate.mjs` with a ledger table and a
  transaction-scoped advisory lock (safe behind poolers like Neon).
- The app polls for workspace changes every 15s; there is no push transport.
- Docker Compose bundles app + PostgreSQL for self-contained deployment.
