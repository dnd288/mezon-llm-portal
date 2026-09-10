import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-me-to-a-random-64-char-string",
);

const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE) || 86400; // 24h

export interface SessionPayload extends JWTPayload {
  /** new-api user id */
  userId: number;
  /** Mezon OAuth access token (userinfo only — not used for API calls) */
  accessToken: string;
  /** new-api login session token; authorizes all user-scoped backend calls */
  backendAccessToken: string;
  /** unix seconds when backendAccessToken expires */
  backendExpiresAt?: number;
  /** mezon username / display name */
  username: string;
  /** mezon user id from OAuth */
  mezonUserId: string;
}

export async function createSession(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
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
