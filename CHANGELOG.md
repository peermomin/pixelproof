# Changelog

All notable changes will be recorded here. The Git history was reconstructed for publication; commit contents reflect the actual implementation.

## Unreleased

- Prepared the existing Pixelproof source snapshot for Git publication.
- Added contribution guidance, issue and pull-request templates, and CI for lint/build checks.
- Configured screenshot persistence in PostgreSQL and migration locking for pooled database connections.
- Modularized the review workspace UI into focused components under `src/components/`.
- Added a Node.js test suite for review-domain and payload validation, wired into CI.
- Added `GET /api/health` liveness probe, `SECURITY.md`, and `docs/ARCHITECTURE.md`.
- Applied Dependabot updates for Actions, dotenv, drizzle-orm, @types/node, and ESLint.
