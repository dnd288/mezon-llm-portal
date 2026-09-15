import { NextResponse } from "next/server";
import { createToken, getTokens } from "@/lib/api";
import { getRouteBackendSession, jsonWithOptionalSessionCookie } from "@/lib/route-auth";

export async function GET() {
  const backend = await getRouteBackendSession();
  if (!backend) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const tokens = await getTokens({ accessToken: backend.session.backendAccessToken });
    return jsonWithOptionalSessionCookie(
      { success: true, data: tokens },
      undefined,
      backend.sessionToken,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Không thể tải danh sách token";
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const backend = await getRouteBackendSession();
  if (!backend) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { name, expired_time, remain_quota, unlimited_quota, group } = body as {
      name?: string;
      expired_time?: number;
      remain_quota?: number;
      unlimited_quota?: boolean;
      group?: string;
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Tên key là bắt buộc" },
        { status: 400 },
      );
    }

    const token = await createToken(
      {
        name: name.trim(),
        expired_time,
        remain_quota,
        unlimited_quota,
        group: typeof group === "string" && group.trim() ? group.trim() : undefined,
      },
      { accessToken: backend.session.backendAccessToken },
    );

    return jsonWithOptionalSessionCookie(
      { success: true, data: token },
      undefined,
      backend.sessionToken,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Không thể tạo token";
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 },
    );
  }
}
