import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserLogs } from "@/lib/api";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Chưa đăng nhập" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(0, Number(searchParams.get("page")) || 0);
  const size = Math.min(100, Math.max(1, Number(searchParams.get("size")) || 20));

  try {
    const result = await getUserLogs({
      accessToken: session.backendAccessToken,
      page,
      size,
    });
    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể tải nhật ký";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
