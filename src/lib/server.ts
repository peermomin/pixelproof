import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/db";
import { projects, workspaceMembers } from "@/db/schema";

export async function currentUser() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Response("Authentication required", { status: 401 });
  return user;
}

export async function workspaceRole(workspaceId: string, userId: string) {
  const [member] = await getDb().select({ role: workspaceMembers.role }).from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId))).limit(1);
  return member?.role ?? null;
}

export function toProject(row: typeof projects.$inferSelect) {
  return { id: row.id, name: row.name, client: row.client, url: row.url, ...row.data, revision: row.revision, updatedAt: row.updatedAt.toISOString() };
}
