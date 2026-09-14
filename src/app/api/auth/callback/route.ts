import { NextResponse, type NextRequest } from "next/server";
import {
  createSession,
  sessionCookieOptions,
} from "@/lib/auth";
import { getBackendUsernameCandidates } from "@/lib/backend-identity";
import {
  type AdminUserSummary,
  adminSearchUsers,
  adminCreateUser,
  adminUpdateUserPassword,
  deriveSyncPassword,
  loginUser,
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

    // Sync with new-api backend using admin token. Candidate usernames are
    // tried in anchor order; the first exact match adopts that account.
    let newApiUserId: number | null = null;
    let backendUsername = "";
    const candidates = await getBackendUsernameCandidates(username, mezonUserId);

    if (NEW_API_ADMIN_TOKEN) {
      let adopted: AdminUserSummary | undefined;
      for (const candidate of candidates) {
        const found = await adminSearchUsers(candidate, {
          adminToken: NEW_API_ADMIN_TOKEN,
        });
        // Exact matches only: the backend LIKE search returns substrings.
        // Adopting a non-common role would leak elevated rights into the
        // portal; disabled accounts stay unlinked too.
        const exact = found.find((u) => u.username === candidate);
        if (exact) {
          if (exact.role !== undefined && exact.role !== 1) {
            console.error(
              `new-api account ${candidate} has role ${exact.role}; refusing to adopt`,
            );
            break;
          }
          if (exact.status !== undefined && exact.status !== 1) {
            console.error(
              `new-api account ${candidate} is disabled (status ${exact.status}); refusing to adopt`,
            );
            break;
          }
          adopted = exact;
          break;
        }
      }

      if (adopted) {
        newApiUserId = adopted.id;
        backendUsername = adopted.username;
        // Re-sync the password so the server can always mint a backend
        // login session (covers hand-created accounts and legacy ghost
        // accounts whose creation-time password was discarded).
        const updated = await adminUpdateUserPassword(
          {
            id: adopted.id,
            username: adopted.username,
            display_name: adopted.display_name || displayName,
            password: await deriveSyncPassword(mezonUserId),
            group: adopted.group,
          },
          { adminToken: NEW_API_ADMIN_TOKEN },
        );
        if (updated?.success === false) {
          console.error(
            "new-api password sync rejected:",
            updated.message ?? "unknown error",
          );
        }
      } else {
        // No existing account: create under the highest-priority anchor
        const createName = candidates[0];
        const created = await adminCreateUser(
          {
            username: createName,
            display_name: displayName,
            password: await deriveSyncPassword(mezonUserId),
          },
          { adminToken: NEW_API_ADMIN_TOKEN },
        );
        if (created?.success === false) {
          console.error(
            "new-api user create rejected:",
            created.message ?? "unknown error",
          );
        }

        const createdUsers = await adminSearchUsers(createName, {
          adminToken: NEW_API_ADMIN_TOKEN,
        });
        const createdExact = createdUsers.find(
          (u) => u.username === createName,
        );
        if (createdExact) {
          newApiUserId = createdExact.id;
          backendUsername = createName;
        }
      }
    }

    if (!newApiUserId) {
      console.error("Failed to sync user with new-api");
      return NextResponse.redirect(
        new URL("/login?error=user_sync_failed", request.url),
      );
    }

    // Mint a backend session for the synced user; all user-scoped portal
    // calls run with this token, not the Mezon OAuth token.
    let backendSession;
    try {
      backendSession = await loginUser(
        backendUsername,
        await deriveSyncPassword(mezonUserId),
      );
    } catch (loginError) {
      console.error("new-api login failed:", loginError);
      return NextResponse.redirect(
        new URL("/login?error=backend_login_failed", request.url),
      );
    }

    // Create JWT session
    const sessionToken = await createSession({
      userId: newApiUserId,
      accessToken: mezonAccessToken,
      backendUsername,
      backendAccessToken: backendSession.accessToken,
      backendExpiresAt: backendSession.expiresAt,
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
