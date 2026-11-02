import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { invitations, workspaceMembers } from "@/db/schema";
import { requireUser } from "@/lib/server";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { token } = await request.json();
    if (typeof token !== "string" || token.length > 200) return NextResponse.json({ error: "Invalid invite link." }, { status: 400 });
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const result = await getDb().transaction(async (tx) => {
      const [invite] = await tx.delete(invitations).where(and(eq(invitations.tokenHash, tokenHash), gt(invitations.expiresAt, new Date()))).returning();
      if (!invite) return null;
      await tx.insert(workspaceMembers).values({ workspaceId: invite.workspaceId, userId: user.id, role: invite.role }).onConflictDoNothing();
      return invite.workspaceId;
    });
    if (!result) return NextResponse.json({ error: "This invite link is invalid or expired." }, { status: 404 });
    return NextResponse.json({ workspaceId: result });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("POST invite accept", error);
    return NextResponse.json({ error: "Could not accept this invite." }, { status: 500 });
  }
}
