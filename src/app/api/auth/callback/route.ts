import { NextResponse, type NextRequest } from "next/server";
import {
  createSession,
  sessionCookieOptions,
} from "@/lib/auth";
import {
  adminSearchUsers,
  adminCreateUser,
} from "@/lib/api";

const MEZON_TOKEN_URL =
  process.env.MEZON_TOKEN_URL || "https://oauth2.mezon.ai/oauth2/token";
const MEZON_USERINFO_URL =
  process.env.MEZON_USERINFO_URL || "https://oauth2.mezon.ai/userinfo";
const CLIENT_ID = process.env.MEZON_CLIENT_ID;
const CLIENT_SECRET = process.env.MEZON_CLIENT_SECRET;
const REDIRECT_URI = process.env.MEZON_REDIRECT_URI;
const NEW_API_ADMIN_TOKEN = process.env.NEW_API_ADMIN_TOKEN;

interface MezonTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface MezonUserInfo {
  sub: string;
  username?: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
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
    // Exchange code for token — MUST use application/x-www-form-urlencoded
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
    const mezonUserId = userinfo.sub;
    const username = userinfo.preferred_username || userinfo.username || userinfo.name || `user_${mezonUserId}`;
    const displayName = userinfo.name || userinfo.preferred_username || username;

    // Sync with new-api backend using admin token
    let newApiUserId: number | null = null;

    if (NEW_API_ADMIN_TOKEN) {
      // Search for existing user by mezon user id (stored in username or aff_code)
      const existingUsers = await adminSearchUsers(mezonUserId, {
        adminToken: NEW_API_ADMIN_TOKEN,
      });

      if (existingUsers && existingUsers.length > 0) {
        const user = existingUsers[0] as { id: number; username: string };
        newApiUserId = user.id;
      } else {
        // Create new user in new-api
        const createPayload = {
          username: `mezon_${mezonUserId}`,
          display_name: displayName,
          password: crypto.randomUUID(),
        };

        await adminCreateUser(createPayload, {
          adminToken: NEW_API_ADMIN_TOKEN,
        });

        // Search again to get the created user id
        const createdUsers = await adminSearchUsers(mezonUserId, {
          adminToken: NEW_API_ADMIN_TOKEN,
        });
        if (createdUsers && createdUsers.length > 0) {
          const user = createdUsers[0] as { id: number };
          newApiUserId = user.id;
        }
      }
    }

    if (!newApiUserId) {
      console.error("Failed to sync user with new-api");
      return NextResponse.redirect(
        new URL("/login?error=user_sync_failed", request.url),
      );
    }

    // Create JWT session
    const sessionToken = await createSession({
      userId: newApiUserId,
      accessToken: mezonAccessToken,
      username,
      mezonUserId,
    });

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
