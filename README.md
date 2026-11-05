# Pixelproof

**A self-hosted visual QA workspace for website releases.** Reviewers can track pages, pin actionable feedback to screenshots, discuss issues, and work through a release checklist together. Accounts, review data, and uploaded images live on your server.

## What you can do

- Create accounts and sign in with secure, database-backed sessions.
- Keep multiple website review projects in a PostgreSQL-backed workspace.
- Invite teammates with one-time links that expire after seven days.
- Share the same workspace data across accounts; open tabs refresh every 15 seconds and when focused.
- Upload PNG, JPEG, or WebP page captures (up to 12 MB each), then pin feedback to image coordinates.
- Keep screenshot bytes in PostgreSQL alongside the project database; the app requires no persistent local upload directory or object-storage account.
- Track issue category, priority, status, comments, page progress, and release checks.
- Export and import JSON project backups.
- Run the complete app and database with Docker Compose, or run Next.js against your own PostgreSQL server.

The built-in Sprout project is starter content created in a new account. It demonstrates the workflow; upload your own screenshots to review a real interface. Pixelproof does not fetch arbitrary websites or bypass their embed restrictions.

Screenshot data counts toward your PostgreSQL provider's storage quota, so keep captures reasonably sized. Each upload is limited to 12 MB.

## Quick start: Docker

Requirements: Docker Engine or Docker Desktop with the Compose plugin.

```bash
npm run setup
docker compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000), create an account, and start reviewing. `npm run setup` creates `.env` with fresh random database and authentication secrets. Keep that file private and back it up securely; losing the database password or auth secret can make existing data or sessions unavailable.

The Compose setup stores the database, including screenshot bytes, in the `pixelproof-postgres` volume. It survives container rebuilds. To stop the app without removing data, use `docker compose down`. **Do not use `docker compose down -v` unless you intend to delete accounts, review data, and screenshots.**

## Local development

Requirements: Node.js 20.9+ and PostgreSQL 15+.

1. Create and configure `.env` with the same secure values as `.env.example`. For a PostgreSQL server on your host, set `DATABASE_URL` to its reachable connection string (for example, `postgresql://pixelproof:password@localhost:5432/pixelproof`). Set `BETTER_AUTH_URL=http://localhost:3000`.
2. Install dependencies and prepare the database:

   ```bash
   npm install
   npm run db:migrate
   npm run dev
   ```

Migrations are versioned SQL files in `drizzle/` and run once using a database migration ledger and PostgreSQL advisory lock. The server also runs migrations on container startup.

If upgrading a database created by an earlier Pixelproof build, migration `0002` moves storage metadata to the new schema but cannot copy image bytes from the old app server. Existing screenshots will need to be uploaded again. New installations store image bytes directly in PostgreSQL.

## Production deployment

Deploy the Docker image on a host that supports Docker, or run the Next.js Node server with a reachable PostgreSQL database. Configure these environment variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `BETTER_AUTH_SECRET` | Yes | Random secret, at least 32 characters. Use a different secret per environment. |
| `BETTER_AUTH_URL` | Yes | Public canonical origin, including `https://` in production. |
| `DATABASE_POOL_SIZE` | No | PostgreSQL connection pool size; defaults to 10. |

Use HTTPS at the public edge, configure the app's public origin exactly in `BETTER_AUTH_URL`, and restrict database network access to the app. Project records and uploaded screenshots are stored in PostgreSQL, so the app server does not need a persistent disk or a separate file-storage service. Back up the database to preserve everything. Set an appropriate upload and request-size limit on any reverse proxy. `docker-compose.yml` is a single-instance deployment; multiple app replicas can share the same PostgreSQL database.

For a hosted PostgreSQL provider such as Neon, set its connection string as `DATABASE_URL` in the Next.js host's environment settings, then run `npm run db:migrate` against that same database before serving traffic. Do not commit `.env` or paste database credentials into source files.

There is no external database, auth, or object-storage account required. Password reset and email verification are not enabled because the project does not assume an email provider. Use a trusted single-user/team deployment or add a configured mail delivery service before opening public self-registration to the internet.

## Security and data model

- Authentication: Better Auth email/password, 12-character minimum, HTTP-only session cookies, and PostgreSQL-backed sessions.
- Authorization: every project, invitation, and screenshot request checks workspace membership; viewer role is read-only.
- Concurrent edits: project updates use a monotonically increasing revision and return `409 Conflict` when the browser's copy is stale.
- Uploads: raster image types only, file signatures checked, 12 MB limit, UUID asset IDs, authenticated downloads, and `nosniff` responses. Image bytes are stored as PostgreSQL `bytea`.
- Invite links: random bearer tokens are stored as SHA-256 hashes, expire in seven days, and are consumed once.
- Backups: JSON exports include review data but not screenshot bytes. Back up PostgreSQL to include uploaded images.

## Architecture and API

The browser interface lives in `src/app/page.tsx`. It reads and writes through authenticated Next.js route handlers; PostgreSQL is the source of truth. `src/db/schema.ts` defines Better Auth tables and Pixelproof workspace, membership, project, invitation, and asset tables. Project detail is stored as JSONB with a revision counter, while image bytes use PostgreSQL `bytea`. SQL changes are versioned under `drizzle/`.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET`, `POST` | `/api/auth/[...all]` | Better Auth sign-up, sign-in, session, and sign-out handlers. |
| `GET`, `POST` | `/api/projects` | List accessible workspace projects or create one. |
| `PUT` | `/api/projects/:projectId` | Save a project with optimistic revision checking. |
| `POST` | `/api/projects/import` | Import project copies in one database transaction. |
| `POST` | `/api/projects/:projectId/assets` | Validate and store a page screenshot in PostgreSQL. |
| `GET` | `/api/assets/:assetId` | Read a screenshot after workspace membership checks. |
| `POST` | `/api/invitations` | Create a single-use workspace invitation. |
| `POST` | `/api/invitations/accept` | Redeem an invitation for the signed-in account. |

All project and screenshot routes enforce workspace membership. Viewer members have read-only access. The invite token is returned only at creation time; it is stored as a hash and expires after seven days.

## Tests and checks

`npm test` runs the Node.js test suite covering review-domain validation, backup import rules, and project payload schemas. CI runs lint, tests, and a production build on pushes and pull requests.

## Commands

```bash
npm run dev        # development server
npm run build      # optimized production build
npm run start      # production server (migrations run separately outside Docker)
npm run lint       # ESLint
npm run test       # Node.js test suite for domain validation
npm run db:migrate # apply pending SQL migrations
```

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS 4 and Lucide icons
- Better Auth with PostgreSQL-backed sessions
- Drizzle ORM and versioned SQL migrations
- PostgreSQL for accounts, workspaces, projects, invites, and asset metadata
- PostgreSQL `bytea` storage for uploaded screenshots

## Project structure

```text
src/app/            App Router pages and API route handlers
src/components/     Review workspace UI components
src/db/             PostgreSQL schema and lazy runtime connection
src/lib/            Auth setup, server helpers, validation, domain types, formatting
drizzle/            Versioned PostgreSQL migrations
scripts/            First-run secrets and migration runner
tests/              Node.js test suite for domain and payload validation
Dockerfile          Production container
docker-compose.yml  App, PostgreSQL, health checks, and database volume
```
