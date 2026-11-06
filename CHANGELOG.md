# Changelog

All notable changes will be recorded here. The repository is being initialized from an existing local project, so the initial release history is not represented as original Git activity.

## Unreleased

- Prepared the existing Pixelproof source snapshot for Git publication.
- Added a retrospective development history that separates owner-reported development dates from Git publication dates.
- Added contribution guidance, issue and pull-request templates, and CI for lint/build checks.
- Configured screenshot persistence in PostgreSQL and migration locking for pooled database connections.
- Modularized the review workspace UI into focused components under `src/components/`.
- Added a Node.js test suite for review-domain and payload validation, wired into CI.
- Added `GET /api/health` liveness probe, `SECURITY.md`, and `docs/ARCHITECTURE.md`.
- Applied Dependabot updates for Actions, dotenv, drizzle-orm, @types/node, and ESLint.
