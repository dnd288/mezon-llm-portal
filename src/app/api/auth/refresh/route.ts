import { NextResponse, type NextRequest } from "next/server";
import {
  createRefreshedSessionToken,
  getSession,
  isBackendTokenExpiring,
  setSessionCookie,
} from "@/lib/auth";

function safeNextPath(request: NextRequest): string {
  const next = request.nextUrl.searchParams.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.redirect(new URL(safeNextPath(request), request.url));
  if (!isBackendTokenExpiring(session)) {
    return response;
  }

  try {
    const refreshed = await createRefreshedSessionToken(session);
    setSessionCookie(response, refreshed.token);
    return response;
  } catch (error) {
    console.error("Backend session refresh failed:", error);
    const login = new URL("/login", request.url);
    login.searchParams.set("error", "backend_refresh_failed");
    return NextResponse.redirect(login);
  }
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!isBackendTokenExpiring(session)) {
    return NextResponse.json({ success: true });
  }

  try {
    const refreshed = await createRefreshedSessionToken(session);
    const response = NextResponse.json({ success: true });
    setSessionCookie(response, refreshed.token);
    return response;
  } catch (error) {
    console.error("Backend session refresh failed:", error);
    return NextResponse.json(
      { success: false, error: "Không thể gia hạn phiên" },
      { status: 502 },
    );
  }
}
