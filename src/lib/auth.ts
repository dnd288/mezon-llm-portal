import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { deriveSyncPassword, loginUser } from "@/lib/api";
import { getBackendUsernameCandidates } from "@/lib/backend-identity";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-me-to-a-random-64-char-string",
);

const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE) || 86400; // 24h
const BACKEND_TOKEN_REFRESH_SKEW_SECONDS = 300;

export interface SessionPayloadBase {
  /** new-api user id */
  userId: number;
  /** Mezon OAuth access token (userinfo only — not used for API calls) */
  accessToken: string;
  /** new-api login username */
  backendUsername?: string;
  /** new-api login session token; authorizes all user-scoped backend calls */
  backendAccessToken: string;
  /** unix seconds when backendAccessToken expires */
  backendExpiresAt?: number;
  /** mezon username / display name */
  username: string;
  /** mezon user id from OAuth */
  mezonUserId: string;
}

export interface SessionPayload extends SessionPayloadBase, JWTPayload {}

export async function createSession(payload: SessionPayloadBase): Promise<string> {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifySession(token);
}

export function isBackendTokenExpiring(
  session: Pick<SessionPayload, "backendExpiresAt">,
  now = Date.now(),
): boolean {
  if (!session.backendExpiresAt) return true;
  return session.backendExpiresAt <= Math.floor(now / 1000) + BACKEND_TOKEN_REFRESH_SKEW_SECONDS;
}

export async function refreshBackendSessionPayload(
  session: SessionPayload,
): Promise<SessionPayloadBase> {
  const candidates = session.backendUsername
    ? [session.backendUsername]
    : await getBackendUsernameCandidates(session.username, session.mezonUserId);
  const password = await deriveSyncPassword(session.mezonUserId);
  let refreshedBackendSession: Awaited<ReturnType<typeof loginUser>> | null = null;
  let refreshedBackendUsername = candidates[0];

  for (const candidate of candidates) {
    try {
      refreshedBackendSession = await loginUser(candidate, password);
      refreshedBackendUsername = candidate;
      break;
    } catch {}
  }

  if (!refreshedBackendSession) {
    throw new Error("Unable to refresh backend session");
  }

  return {
    userId: session.userId,
    accessToken: session.accessToken,
    backendUsername: refreshedBackendUsername,
    backendAccessToken: refreshedBackendSession.accessToken,
    backendExpiresAt: refreshedBackendSession.expiresAt,
    username: session.username,
    mezonUserId: session.mezonUserId,
  };
}

export async function createRefreshedSessionToken(
  session: SessionPayload,
): Promise<{ session: SessionPayloadBase; token: string }> {
  const refreshedSession = await refreshBackendSessionPayload(session);
  return {
    session: refreshedSession,
    token: await createSession(refreshedSession),
  };
}

export function setSessionCookie(
  response: { cookies: { set: (name: string, value: string, options: Omit<ReturnType<typeof sessionCookieOptions>, "name">) => void } },
  token: string,
) {
  const cookieOpts = sessionCookieOptions();
  response.cookies.set(cookieOpts.name, token, {
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    path: cookieOpts.path,
    maxAge: cookieOpts.maxAge,
  });
}

export function sessionCookieOptions() {
  return {
    name: "session",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
