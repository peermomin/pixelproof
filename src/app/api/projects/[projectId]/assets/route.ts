import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { projects, reviewAssets } from "@/db/schema";
import { requireUser, toProject, workspaceRole } from "@/lib/server";

export const runtime = "nodejs";
const maxBytes = 12 * 1024 * 1024;

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await requireUser();
    const { projectId } = await context.params;
    const form = await request.formData();
    const file = form.get("file");
    const pageId = String(form.get("pageId") ?? "");
    if (!(file instanceof File) || !pageId) return NextResponse.json({ error: "Choose an image and review page." }, { status: 400 });
    if (file.size < 1 || file.size > maxBytes) return NextResponse.json({ error: "Images must be 12 MB or smaller." }, { status: 413 });
    const [project] = await getDb().select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!project || !await workspaceRole(project.workspaceId, user.id)) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    const role = await workspaceRole(project.workspaceId, user.id);
    if (role === "viewer") return NextResponse.json({ error: "Viewers cannot upload screenshots." }, { status: 403 });
    const data = project.data as { pages: Array<{ id: string; screenshotAssetId?: string }>; issues: unknown[]; checklist: unknown[] };
    if (!data.pages.some((page) => page.id === pageId)) return NextResponse.json({ error: "Page not found in project." }, { status: 404 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const signatures: [string, string, string][] = [["image/png", "png", "89504e470d0a1a0a"], ["image/jpeg", "jpg", "ffd8ff"], ["image/webp", "webp", "52494646"]];
    const detected = signatures.find(([, , signature]) => bytes.subarray(0, signature.length).toString("hex") === signature);
    if (!detected || (detected[0] === "image/webp" && bytes.subarray(8, 12).toString("ascii") !== "WEBP")) return NextResponse.json({ error: "Upload a valid PNG, JPEG, or WebP image." }, { status: 415 });
    const id = randomUUID();
    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || `screenshot.${detected[1]}`;
    const nextData = { ...data, pages: data.pages.map((page) => page.id === pageId ? { ...page, screenshotAssetId: id } : page) };
    const [saved] = await getDb().transaction(async (tx) => {
      await tx.insert(reviewAssets).values({ id, workspaceId: project.workspaceId, projectId, pageId, fileName, content: bytes, contentType: detected[0], size: bytes.length, createdBy: user.id });
      const [row] = await tx.update(projects).set({ data: nextData, revision: project.revision + 1, updatedAt: new Date() }).where(and(eq(projects.id, projectId), eq(projects.revision, project.revision))).returning();
      if (!row) throw new Error("PROJECT_CHANGED");
      return [row];
    }).catch((error: unknown) => {
      if (error instanceof Error && error.message === "PROJECT_CHANGED") throw new UploadConflictError();
      throw error;
    });
    return NextResponse.json({ project: toProject(saved), assetId: id }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof UploadConflictError) return NextResponse.json({ error: "Project changed while uploading. Reload and try again." }, { status: 409 });
    console.error("POST project asset", error);
    return NextResponse.json({ error: "Could not store screenshot." }, { status: 500 });
  }
}

class UploadConflictError extends Error {}
