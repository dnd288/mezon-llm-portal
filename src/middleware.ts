import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-me-to-a-random-64-char-string",
);

async function isValidSession(token?: string): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const valid = await isValidSession(token);
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedPaths = ["/dashboard", "/tokens", "/logs", "/vouchers"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !valid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      response.cookies.delete("session");
    }
    return response;
  }

  // If logged in and visiting login page, redirect to dashboard
  if (pathname === "/login" && valid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If visiting /login with an invalid/expired token, clear it
  if (pathname === "/login" && token && !valid) {
    const response = NextResponse.next();
    response.cookies.delete("session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tokens/:path*", "/logs/:path*", "/vouchers/:path*", "/login"],
};
