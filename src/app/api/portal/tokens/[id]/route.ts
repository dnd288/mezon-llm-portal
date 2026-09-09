import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteToken, getTokenKey } from "@/lib/api";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
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
    await deleteToken(tokenId, { accessToken: session.accessToken });
    return NextResponse.json({ success: true });
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
  const session = await getSession();
  if (!session) {
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
      accessToken: session.accessToken,
    });
    return NextResponse.json({ success: true, data: key });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Không thể lấy key";
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 },
    );
  }
}
