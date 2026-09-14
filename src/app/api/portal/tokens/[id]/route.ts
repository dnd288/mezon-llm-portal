import { NextResponse } from "next/server";
import { deleteToken, getTokenKey } from "@/lib/api";
import { getRouteBackendSession, jsonWithOptionalSessionCookie } from "@/lib/route-auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const backend = await getRouteBackendSession();
  if (!backend) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const tokenId = Number(id);
  if (!Number.isInteger(tokenId) || tokenId <= 0) {
    return NextResponse.json(
      { success: false, error: "ID không hợp lệ" },
      { status: 400 },
    );
  }

  try {
    await deleteToken(tokenId, { accessToken: backend.session.backendAccessToken });
    return jsonWithOptionalSessionCookie(
      { success: true },
      undefined,
      backend.sessionToken,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Không thể xóa token";
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 },
    );
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const backend = await getRouteBackendSession();
  if (!backend) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const tokenId = Number(id);
  if (!Number.isInteger(tokenId) || tokenId <= 0) {
    return NextResponse.json(
      { success: false, error: "ID không hợp lệ" },
      { status: 400 },
    );
  }

  try {
    const key = await getTokenKey(tokenId, {
      accessToken: backend.session.backendAccessToken,
    });
    return jsonWithOptionalSessionCookie(
      { success: true, data: key },
      undefined,
      backend.sessionToken,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Không thể lấy key";
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 },
    );
  }
}
