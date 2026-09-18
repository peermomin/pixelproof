import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { projects } from "@/db/schema";
import { projectPayloadSchema } from "@/lib/validation";
import { requireUser, toProject, workspaceRole } from "@/lib/server";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = projectPayloadSchema.array().min(1).max(20).safeParse(body.projects);
    if (!parsed.success) return NextResponse.json({ error: "Backup must contain 1 to 20 valid projects." }, { status: 400 });
    const ids = new Set(parsed.data.map((project) => project.id));
    if (ids.size !== parsed.data.length) return NextResponse.json({ error: "Project IDs must be unique in the backup." }, { status: 400 });
    const workspaceId = String(body.workspaceId ?? "");
    const role = await workspaceRole(workspaceId, user.id);
    if (!role) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    if (role === "viewer") return NextResponse.json({ error: "Viewers cannot import projects." }, { status: 403 });
    const created = await getDb().transaction(async (tx) => {
      const rows = [];
      for (const project of parsed.data) {
        const { id, name, client, url, pages, issues, checklist } = project;
        const [row] = await tx.insert(projects).values({ id, workspaceId, name, client, url, revision: 1, data: { pages, issues, checklist } }).returning();
        rows.push(row);
      }
      return rows;
    });
    return NextResponse.json({ projects: created.map(toProject) }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("POST project import", error);
    return NextResponse.json({ error: "Could not import projects. Check that project IDs are new." }, { status: 500 });
  }
}
