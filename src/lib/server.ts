import { headers } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/db";
import { projects, workspaceMembers, workspaces } from "@/db/schema";

export async function currentUser() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Response("Authentication required", { status: 401 });
  return user;
}

export async function ensureWorkspace(user: { id: string; name: string; email: string }) {
  const db = getDb();
  const existing = await db.select({ id: workspaces.id, name: workspaces.name, role: workspaceMembers.role })
    .from(workspaceMembers).innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, user.id));
  if (existing.length) return existing;

  const workspaceId = crypto.randomUUID();
  const demoId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${user.id}))`);
    const recheck = await tx.select({ id: workspaces.id, name: workspaces.name, role: workspaceMembers.role })
      .from(workspaceMembers).innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(eq(workspaceMembers.userId, user.id));
    if (recheck.length) return;
    const name = `${user.name}'s workspace`;
    await tx.insert(workspaces).values({ id: workspaceId, name });
    await tx.insert(workspaceMembers).values({ workspaceId, userId: user.id, role: "owner" });
    const demo = (await import("@/lib/pixelproof")).createDemoProject();
    const { pages, issues, checklist, ...metadata } = demo;
    await tx.insert(projects).values({ id: demoId, workspaceId, name: metadata.name, client: metadata.client, url: metadata.url, revision: 1, data: { pages, issues, checklist } });
  });
  return db.select({ id: workspaces.id, name: workspaces.name, role: workspaceMembers.role })
    .from(workspaceMembers).innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, user.id));
}

export async function workspaceRole(workspaceId: string, userId: string) {
  const [member] = await getDb().select({ role: workspaceMembers.role }).from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId))).limit(1);
  return member?.role ?? null;
}

export function toProject(row: typeof projects.$inferSelect) {
  return { id: row.id, name: row.name, client: row.client, url: row.url, ...row.data, revision: row.revision, updatedAt: row.updatedAt.toISOString() };
}
