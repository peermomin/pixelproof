import { test } from "node:test";
import assert from "node:assert/strict";
import { createDemoProject, createId, validateBackup, type ReviewProject } from "../src/lib/pixelproof.ts";

function validProject(): ReviewProject {
  return {
    id: "proj-1",
    name: "Acme refresh",
    client: "Acme",
    url: "https://acme.example.com",
    updatedAt: "2026-11-01T10:00:00.000Z",
    revision: 3,
    pages: [
      { id: "home", name: "Home", path: "/", url: "https://acme.example.com", reviewed: true },
    ],
    issues: [
      {
        id: "issue-1",
        pageId: "home",
        title: "Contrast too low",
        description: "Fails WCAG AA",
        category: "Accessibility",
        priority: "High",
        status: "Open",
        x: 50,
        y: 40,
        author: "Reviewer",
        createdAt: "2026-11-01T10:00:00.000Z",
        comments: [{ id: "c1", text: "Agreed", author: "Dev", createdAt: "2026-11-01T11:00:00.000Z" }],
      },
    ],
    checklist: [{ id: "check-1", label: "Proofread", complete: false }],
  };
}

test("createDemoProject returns a complete starter project", () => {
  const demo = createDemoProject();
  assert.equal(demo.id, "sprout-marketing");
  assert.ok(demo.pages.length >= 4);
  assert.ok(demo.issues.length >= 4);
  assert.ok(demo.checklist.length >= 5);
  assert.ok(demo.pages.every((page) => page.url.startsWith("https://")));
  assert.ok(demo.issues.every((issue) => issue.pageId && issue.x >= 0 && issue.x <= 100));
});

test("createId produces prefixed unique identifiers", () => {
  const a = createId("issue");
  const b = createId("issue");
  assert.ok(a.startsWith("issue-"));
  assert.notEqual(a, b);
});

test("validateBackup accepts a well-formed project list", () => {
  const projects = validateBackup([validProject()]);
  assert.equal(projects.length, 1);
  assert.equal(projects[0].id, "proj-1");
});

test("validateBackup rejects non-array and empty input", () => {
  assert.throws(() => validateBackup(null), /at least one project/);
  assert.throws(() => validateBackup({}), /at least one project/);
  assert.throws(() => validateBackup([]), /at least one project/);
});

test("validateBackup rejects malformed project fields", () => {
  const bad = validProject() as Record<string, unknown>;
  bad.url = "ftp://not-allowed";
  assert.throws(() => validateBackup([bad]), /does not look like a Pixelproof project backup/);
});

test("validateBackup rejects duplicate project ids", () => {
  assert.throws(() => validateBackup([validProject(), validProject()]), /IDs must be unique/);
});

test("validateBackup rejects issues pointing at unknown pages", () => {
  const project = validProject();
  project.issues[0].pageId = "missing-page";
  assert.throws(() => validateBackup([project]), /invalid feedback entry/);
});

test("validateBackup rejects out-of-range pin coordinates", () => {
  const project = validProject();
  project.issues[0].x = 140;
  assert.throws(() => validateBackup([project]), /invalid feedback entry/);
});

test("validateBackup rejects unknown issue categories", () => {
  const project = validProject();
  project.issues[0].category = "Stylistic" as never;
  assert.throws(() => validateBackup([project]), /invalid feedback entry/);
});
