import { createHash, randomBytes, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { invitations, workspaces } from "@/db/schema";
import { requireUser, workspaceRole } from "@/lib/server";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { workspaceId } = await request.json();
    const role = await workspaceRole(String(workspaceId ?? ""), user.id);
    if (role !== "owner" && role !== "editor") return NextResponse.json({ error: "Only workspace members can invite teammates." }, { status: 403 });
    const [workspace] = await getDb().select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
    if (!workspace) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await getDb().insert(invitations).values({ id: randomUUID(), workspaceId, tokenHash, role: "editor", createdBy: user.id, expiresAt: new Date(Date.now() + 7 * 86400000) });
    const base = process.env.BETTER_AUTH_URL ?? new URL(request.url).origin;
    return NextResponse.json({ url: `${base}/?invite=${token}`, expiresInDays: 7 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("POST invitations", error);
    return NextResponse.json({ error: "Could not create invite." }, { status: 500 });
  }
}
