import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTokens, createToken } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const tokens = await getTokens({ accessToken: session.accessToken });
    return NextResponse.json({ success: true, data: tokens });
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
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { name, expired_time, remain_quota, unlimited_quota } = body as {
      name?: string;
      expired_time?: number;
      remain_quota?: number;
      unlimited_quota?: boolean;
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
      },
      { accessToken: session.accessToken },
    );

    return NextResponse.json({ success: true, data: token });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Không thể tạo token";
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 },
    );
  }
}
