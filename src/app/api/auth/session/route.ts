import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      userId: session.userId,
      username: session.username,
      mezonUserId: session.mezonUserId,
    },
  });
}
