# Contributing

Thanks for helping improve Pixelproof. Keep changes focused, describe user-visible behavior, and preserve clear tenant boundaries between workspaces.

## Branches and pull requests

- `main` is the release branch.
- `develop` is the integration branch.
- Use `feature/<short-name>`, `bugfix/<short-name>`, `refactor/<short-name>`, or `docs/<short-name>` for new work.
- Open pull requests against `develop`; merge a reviewed and green `develop` into `main` for a release.
- Do not claim that a historical change was reviewed or tested unless there is a corresponding record.

## Commits

Use concise Conventional Commit subjects, for example:

- `feat(review): add screenshot annotations`
- `fix(db): make pooled migrations transaction safe`
- `docs(history): clarify retrospective dates`

Split changes by coherent behavior. Do not split commits merely to increase their count.

## Development

Requirements: Node.js 20.9+, npm, and PostgreSQL, or Docker Compose.

```bash
npm install
npm run db:migrate
npm run dev
```

Before opening a PR, run the checks available to you:

```bash
npm run lint
npm run build
```

There is a small Node.js test suite under `tests/` covering domain validation; extend it when changing review or payload rules and keep CI green. Never include `.env`, database URLs, auth secrets, uploaded user data, or other credentials in a commit.

## Pull request expectations

- Explain the problem and the implementation.
- Link related issues and note migration or deployment impact.
- Include screenshots for visual changes when practical.
- Report which checks ran and their actual results.
- Call out known gaps; do not report local commands as passing if they could not run.
