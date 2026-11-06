# GitHub achievement and collaboration roadmap

This document tracks legitimate GitHub achievements for the Pixelproof
repository. Nothing here is fabricated: an achievement is only marked earned
after GitHub displays it on the profile. External dependencies are called out
explicitly.

Last verified against the GitHub API on 2026-11-06.

## Verified repository state

| Item | State |
| --- | --- |
| Repository | `peermomin/pixelproof`, public, default branch `main` |
| Branches | `main`, `develop`, 12 feature/refactor/chore/test/docs branches |
| Pull requests | 11 total: 10 merged (#1, #6, #12, #13, #15, #16, #17, #19, #20, #21), 1 closed unmerged (#14, TypeScript 7 bump — CI failure) |
| Issues | 8 open (#2, #3, #4, #5, #7, #8, #9, #10); #11 and #18 closed via merged PRs |
| Milestones | v1.1.0 (7 open, 1 closed), v1.2.0 (1 open) |
| Release | v1.0.0 published on `main` |
| CI | GitHub Actions "Lint and production build" green on `main` |
| Branch protection | `main` requires the CI check to pass |
| Topics | nextjs, typescript, postgresql, drizzle-orm, better-auth, visual-qa, self-hosted, docker, tailwindcss |
| Stars / forks | 0 / 0 |

## Achievement tracking

| Achievement | Requirement (official) | Status | Exact next action |
| --- | --- | --- | --- |
| Pull Shark | Pull requests merged into default branch | **Pending** | Already have 4 self-merged PRs into `main`/`develop`; achievement tiers require sustained merged-PR activity over time. Keep shipping real PRs (see below). |
| YOLO | PR merged without a review | **Pending** | Merging PRs without requesting reviewers may qualify; GitHub sometimes excludes self-authored-and-merged flows — verify on profile after the next merge. |
| Quickdraw | PR closed without merging | **Pending (weak)** | #14 was closed unmerged but is bot-authored (Dependabot). A self-authored PR that is genuinely superseded and closed unmerged would count. Do not manufacture one. |
| Pair Extraordinaire | Commits co-authored with commits from another developer | **Blocked — external** | Needs a real collaborator. See "Co-authored contribution plan" below. |
| Galaxy Brain | Accepted answer to a question | **Blocked — external** | Requires answering questions on other repos/discussions that get accepted. Genuine path: help in issues/Discussions once enabled. |
| Starstruck | Repository starred | **Blocked — external** | Needs genuine interest. Improve README/screenshots/demo GIF (see below). |
| Arctic/Other profile badges | Varies (e.g., achievements for discussions, sponsors) | **Blocked — external** | Same dependency on other humans. |

No achievement is currently marked earned; GitHub has not awarded any badge
yet. Check https://github.com/settings/profile for the live list.

## Manual steps only you can complete (no API available)

1. **Enable Discussions**: repo → Settings → Features → Discussions → enable.
   Then seed categories: Announcements, Ideas, Q&A, Show and tell.
2. **GitHub Projects board**: your token lacks the `project` scope. Either
   add the scope at https://github.com/settings/tokens and re-run the
   `createProjectV2` GraphQL mutation, or create the board manually:
   Projects → New project → Board with columns Backlog, Ready,
   In Progress, In Review, Testing, Done; add the 8 open issues.
3. **Screenshots for README**: run `npm run setup && docker compose up`,
   capture the review canvas, issue pin detail, and checklist views, and
   embed them under a "Screenshots" section. A short demo GIF (e.g. via
   ScreenToGif) materially helps Starstruck/contributor conversion.

## Genuine external contribution targets

Matched to the actual stack (Next.js, TypeScript, Drizzle, Better Auth,
PostgreSQL, testing). Verified via GitHub issue search on 2026-11-06:

- `drizzle-team/drizzle-orm` — 2 open "good first issue" bugs
  (#1818 `not` type with `and`/`or`, #1826). Directly relevant: Pixelproof
  depends on Drizzle.
- `vercel/next.js` — active "good first issue" threads exist but the repo is
  high-traffic; pick a scoped bug, not a feature.
- `better-auth/better-auth` — no open good-first-issues at verification
  time; watch the repo or answer questions in Discussions.
- Smaller ecosystem repos are often better first targets: search
  `is:issue is:open label:"good first issue" drizzle` or `better-auth`
  periodically.

For each contribution: read CONTRIBUTING.md, open a discussion/issue first
if unsure, keep PRs small, and request review politely. Merged external PRs
are the strongest legitimate signal for Pull Shark, Galaxy Brain, and
Pair Extraordinaire (if co-authored).

## Co-authored contribution plan

Pair Extraordinaire requires commits co-authored by two different people.
Legitimate ways to reach it:

1. Invite a real collaborator (classmate, colleague, open-source friend) to
   review one of the open issues (#2–#10) and pair on the fix; use
   `Co-authored-by:` trailers for genuine joint work.
2. Pair-program remotely on a small fix (e.g., #11-style docs or a test
   addition) — split commits by who wrote them.
3. Co-author only where work was genuinely shared; do not add trailers to
   solo work.

## Attracting contributors and stars

- README already covers quick start, security model, and API. Add a
  Screenshots section and an architecture diagram (docs/ARCHITECTURE.md
  exists — embed a rendered version).
- Add a "Good first issues" callout pointing at #2–#10 so newcomers see
  scoped entry points.
- Keep Dependabot PRs green and merge promptly — signals an active,
  maintained repo.
- Reply to every issue/PR comment quickly; responsiveness drives both
  contributions and stars.
- Consider a `good first issue` label pass: #10 (Docker smoke test) and
  docs tasks are already labeled.

## Tracking

Update the table above when GitHub awards a badge. Do not pre-mark pending
items as earned.
