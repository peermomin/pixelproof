import { test } from "node:test";
import assert from "node:assert/strict";
import { projectPayloadSchema } from "../src/lib/validation.ts";

function validPayload() {
  return {
    id: "proj-1",
    name: "Acme refresh",
    client: "Acme",
    url: "https://acme.example.com",
    pages: [
      { id: "home", name: "Home", path: "/", url: "https://acme.example.com", reviewed: false },
    ],
    issues: [],
    checklist: [],
  };
}

test("projectPayloadSchema accepts a minimal valid project", () => {
  const result = projectPayloadSchema.safeParse(validPayload());
  assert.equal(result.success, true);
});

test("projectPayloadSchema rejects non-http(s) URLs", () => {
  const payload = { ...validPayload(), url: "javascript:alert(1)" };
  assert.equal(projectPayloadSchema.safeParse(payload).success, false);
});

test("projectPayloadSchema rejects empty page lists", () => {
  const payload = { ...validPayload(), pages: [] };
  assert.equal(projectPayloadSchema.safeParse(payload).success, false);
});

test("projectPayloadSchema rejects unknown top-level keys", () => {
  const payload = { ...validPayload(), unexpected: true };
  assert.equal(projectPayloadSchema.safeParse(payload).success, false);
});

test("projectPayloadSchema rejects out-of-range issue coordinates", () => {
  const payload = {
    ...validPayload(),
    issues: [{
      id: "i1", pageId: "home", title: "T", description: "", category: "Visual",
      priority: "Low", status: "Open", x: 150, y: 10, author: "A",
      createdAt: "2026-11-01T00:00:00.000Z", comments: [],
    }],
  };
  assert.equal(projectPayloadSchema.safeParse(payload).success, false);
});

test("projectPayloadSchema accepts optional revision and updatedAt", () => {
  const payload = { ...validPayload(), revision: 4, updatedAt: "2026-11-01T00:00:00.000Z" };
  assert.equal(projectPayloadSchema.safeParse(payload).success, true);
});
