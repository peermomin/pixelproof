import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { projectPayloadSchema } from "@/lib/validation";
import { requireUser, toProject, workspaceRole } from "@/lib/server";

export const runtime = "nodejs";

export async function PUT(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await requireUser();
    const { projectId } = await context.params;
    const body = await request.json();
    const parsed = projectPayloadSchema.safeParse(body.project);
    if (!parsed.success || !Number.isInteger(body.expectedRevision)) return NextResponse.json({ error: "Invalid project update." }, { status: 400 });
    const [existing] = await getDb().select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!existing) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    const role = await workspaceRole(existing.workspaceId, user.id);
    if (!role) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    if (role === "viewer") return NextResponse.json({ error: "Viewers cannot edit projects." }, { status: 403 });
    if (parsed.data.id !== projectId) return NextResponse.json({ error: "Project ID cannot be changed." }, { status: 400 });
    const { name, client, url, pages, issues, checklist } = parsed.data;
    const [updated] = await getDb().update(projects).set({ name, client, url, data: { pages, issues, checklist }, revision: existing.revision + 1, updatedAt: new Date() })
      .where(and(eq(projects.id, projectId), eq(projects.revision, body.expectedRevision))).returning();
    if (!updated) {
      const [latest] = await getDb().select().from(projects).where(eq(projects.id, projectId)).limit(1);
      return NextResponse.json({ error: "This project changed in another session. The latest version has been reloaded; reapply your edit.", project: latest ? toProject(latest) : undefined }, { status: 409 });
    }
    return NextResponse.json({ project: toProject(updated) });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("PUT /api/projects/[projectId]", error);
    return NextResponse.json({ error: "Could not save project." }, { status: 500 });
  }
}
