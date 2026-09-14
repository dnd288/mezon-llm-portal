import { NextResponse } from "next/server";
import { getUserLogs } from "@/lib/api";
import { getRouteBackendSession, jsonWithOptionalSessionCookie } from "@/lib/route-auth";

export async function GET(request: Request) {
  const backend = await getRouteBackendSession();
  if (!backend) {
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
      accessToken: backend.session.backendAccessToken,
      page,
      size,
    });
    return jsonWithOptionalSessionCookie(
      {
        success: true,
        data: result.data,
        total: result.total,
      },
      undefined,
      backend.sessionToken,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể tải nhật ký";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
