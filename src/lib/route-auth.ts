import { NextResponse } from "next/server";
import {
  createRefreshedSessionToken,
  getSession,
  isBackendTokenExpiring,
  setSessionCookie,
  type SessionPayloadBase,
} from "@/lib/auth";

export interface BackendSessionResult {
  session: SessionPayloadBase;
  sessionToken?: string;
}

export async function getRouteBackendSession(): Promise<BackendSessionResult | null> {
  const session = await getSession();
  if (!session) return null;
  if (!isBackendTokenExpiring(session)) return { session };

  try {
    const refreshed = await createRefreshedSessionToken(session);
    return {
      session: refreshed.session,
      sessionToken: refreshed.token,
    };
  } catch (error) {
    console.error("Backend session refresh failed:", error);
    return null;
  }
}

export function jsonWithOptionalSessionCookie(
  body: unknown,
  init: ResponseInit | undefined,
  sessionToken?: string,
) {
  const response = NextResponse.json(body, init);
  if (sessionToken) {
    setSessionCookie(response, sessionToken);
  }
  return response;
}
