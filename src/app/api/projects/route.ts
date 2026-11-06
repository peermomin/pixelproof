import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { projectPayloadSchema } from "@/lib/validation";
import { ensureWorkspace, requireUser, toProject, workspaceRole } from "@/lib/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const workspaces = await ensureWorkspace(user);
    const requested = new URL(request.url).searchParams.get("workspaceId");
    if (requested && !workspaces.some((item) => item.id === requested)) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    const workspace = workspaces.find((item) => item.id === requested) ?? workspaces[0];
    const rows = await getDb().select().from(projects).where(eq(projects.workspaceId, workspace.id)).orderBy(desc(projects.updatedAt));
    return NextResponse.json({ workspaces, workspace, projects: rows.map(toProject) });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("GET /api/projects", error);
    return NextResponse.json({ error: "Could not load workspace projects." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = projectPayloadSchema.safeParse(body.project);
    if (!parsed.success) return NextResponse.json({ error: "Invalid project details.", details: parsed.error.flatten() }, { status: 400 });
    const role = await workspaceRole(String(body.workspaceId ?? ""), user.id);
    if (!role) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    if (role === "viewer") return NextResponse.json({ error: "Viewers cannot create projects." }, { status: 403 });
    const { id, name, client, url, pages, issues, checklist } = parsed.data;
    const [row] = await getDb().insert(projects).values({ id, workspaceId: String(body.workspaceId), name, client, url, revision: 1, data: { pages, issues, checklist } }).returning();
    return NextResponse.json({ project: toProject(row) }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("POST /api/projects", error);
    return NextResponse.json({ error: "Could not create project." }, { status: 500 });
  }
}
