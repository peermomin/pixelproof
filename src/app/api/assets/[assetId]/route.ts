import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { reviewAssets } from "@/db/schema";
import { requireUser, workspaceRole } from "@/lib/server";

export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ assetId: string }> }) {
  try {
    const user = await requireUser();
    const { assetId } = await context.params;
    const [asset] = await getDb().select().from(reviewAssets).where(eq(reviewAssets.id, assetId)).limit(1);
    if (!asset || !await workspaceRole(asset.workspaceId, user.id)) return new Response("Not found", { status: 404 });
    if (!asset.content) return new Response("This screenshot predates database storage. Upload it again to restore the preview.", { status: 410 });
    return new NextResponse(asset.content, { headers: { "Content-Type": asset.contentType, "Content-Length": String(asset.content.byteLength), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": `inline; filename="${asset.fileName.replace(/["\\r\n]/g, "_")}"` } });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("GET asset", error);
    return new Response("Asset unavailable", { status: 404 });
  }
}
