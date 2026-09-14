import { NextResponse, type NextRequest } from "next/server";
import {
  createSession,
  sessionCookieOptions,
} from "@/lib/auth";
import { syncMezonIdentitySession } from "@/lib/mezon-auth";

const MEZON_TOKEN_URL =
  process.env.MEZON_TOKEN_URL || "https://oauth2.mezon.ai/oauth2/token";
const MEZON_USERINFO_URL =
  process.env.MEZON_USERINFO_URL || "https://oauth2.mezon.ai/userinfo";
const CLIENT_ID = process.env.MEZON_CLIENT_ID;
const CLIENT_SECRET = process.env.MEZON_CLIENT_SECRET;
const REDIRECT_URI = process.env.MEZON_REDIRECT_URI;


interface MezonTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface MezonUserInfo {
  sub: string;
  /** Real Mezon user id (short, numeric) — the identity Mezon documents */
  user_id?: string | number;
  username?: string;
  display_name?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Verify state from cookie
  const cookieState = request.cookies.get("oauth_state")?.value;

  if (!state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", request.url),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", request.url),
    );
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_not_configured", request.url),
    );
  }

  try {
    // Exchange code for token — form-encoded body with client credentials
    // (Mezon/Hydra registers this client as token_endpoint_auth_method =
    // client_secret_post; Basic auth is rejected)
    const tokenRes = await fetch(MEZON_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token exchange failed:", tokenRes.status, errText);
      return NextResponse.redirect(
        new URL("/login?error=token_exchange_failed", request.url),
      );
    }

    const tokenData: MezonTokenResponse = await tokenRes.json();
    const mezonAccessToken = tokenData.access_token;

    // Get user info
    const userinfoRes = await fetch(MEZON_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${mezonAccessToken}`,
      },
    });

    if (!userinfoRes.ok) {
      console.error("Userinfo failed:", userinfoRes.status);
      return NextResponse.redirect(
        new URL("/login?error=userinfo_failed", request.url),
      );
    }

    const userinfo: MezonUserInfo = await userinfoRes.json();
    // Prefer the real Mezon user id over Hydra's pairwise `sub` (long opaque
    // string) — user_id keeps `mezon_<id>` usernames short and stable.
    const mezonUserId = String(userinfo.user_id ?? userinfo.sub);
    const username =
      userinfo.username ||
      userinfo.preferred_username ||
      userinfo.name ||
      `user_${mezonUserId}`;
    const displayName =
      userinfo.display_name ||
      userinfo.name ||
      userinfo.preferred_username ||
      username;

    let sessionPayload;
    try {
      sessionPayload = await syncMezonIdentitySession({
        mezonUserId,
        username,
        displayName,
        accessToken: mezonAccessToken,
      });
    } catch (syncError) {
      console.error("new-api user sync failed:", syncError);
      return NextResponse.redirect(
        new URL("/login?error=user_sync_failed", request.url),
      );
    }

    // Create JWT session
    const sessionToken = await createSession(sessionPayload);

    const cookieOpts = sessionCookieOptions();

    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    response.cookies.set(cookieOpts.name, sessionToken, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    // Clear oauth_state cookie
    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=internal_error", request.url),
    );
  }
}
