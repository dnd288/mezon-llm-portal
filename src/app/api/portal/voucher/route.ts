import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { redeemVoucher } from "@/lib/api";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Chưa đăng nhập" },
      { status: 401 },
    );
  }

  let body: { key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }

  const key = body.key?.trim();
  if (!key) {
    return NextResponse.json(
      { success: false, error: "Vui lòng nhập mã voucher" },
      { status: 400 },
    );
  }

  try {
    const result = await redeemVoucher(key, {
      accessToken: session.backendAccessToken,
    });
    return NextResponse.json({
      success: true,
      data: { message: result.message, quota: result.quota },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Mã voucher không hợp lệ";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
