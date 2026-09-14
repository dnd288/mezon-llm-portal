import { NextResponse, type NextRequest } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import {
  decodeChannelAppHashData,
  syncMezonIdentitySession,
  validateMezonChannelAppData,
} from "@/lib/mezon-auth";

const MEZON_APP_SECRET = process.env.MEZON_APP_SECRET || process.env.MEZON_CLIENT_SECRET;

function loginUrlWithError(request: NextRequest, error: string): URL {
  return new URL(`/login?error=${encodeURIComponent(error)}`, request.url);
}

export async function POST(request: NextRequest) {
  let hashData: unknown;

  try {
    hashData = (await request.json())?.hashData;
  } catch {
    return NextResponse.json(
      { success: false, error: "invalid_request" },
      { status: 400 },
    );
  }

  if (typeof hashData !== "string" || !hashData) {
    return NextResponse.json(
      { success: false, error: "missing_hash_data" },
      { status: 400 },
    );
  }

  const rawHashData = decodeChannelAppHashData(hashData);
  if (!rawHashData) {
    return NextResponse.json(
      { success: false, error: "invalid_hash_data" },
      { status: 400 },
    );
  }

  const authResult = validateMezonChannelAppData(MEZON_APP_SECRET, rawHashData);
  if (!authResult.ok) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.error === "channel_app_not_configured" ? 500 : 401 },
    );
  }

  try {
    const sessionPayload = await syncMezonIdentitySession({
      mezonUserId: authResult.user.id,
      username: authResult.user.username,
      displayName: authResult.user.displayName,
      accessToken: `channel-app:${authResult.user.id}`,
    });
    const sessionToken = await createSession(sessionPayload);
    const response = NextResponse.json({ success: true, redirectTo: "/dashboard" });
    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error("Channel App user sync failed:", error);
    return NextResponse.json(
      { success: false, error: "user_sync_failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const hashData = request.nextUrl.searchParams.get("data");
  if (!hashData) {
    return NextResponse.redirect(loginUrlWithError(request, "missing_hash_data"));
  }

  const rawHashData = decodeChannelAppHashData(hashData);
  if (!rawHashData) {
    return NextResponse.redirect(loginUrlWithError(request, "invalid_hash_data"));
  }

  const authResult = validateMezonChannelAppData(MEZON_APP_SECRET, rawHashData);
  if (!authResult.ok) {
    return NextResponse.redirect(loginUrlWithError(request, authResult.error));
  }

  try {
    const sessionPayload = await syncMezonIdentitySession({
      mezonUserId: authResult.user.id,
      username: authResult.user.username,
      displayName: authResult.user.displayName,
      accessToken: `channel-app:${authResult.user.id}`,
    });
    const sessionToken = await createSession(sessionPayload);
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    setSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error("Channel App user sync failed:", error);
    return NextResponse.redirect(loginUrlWithError(request, "user_sync_failed"));
  }
}
