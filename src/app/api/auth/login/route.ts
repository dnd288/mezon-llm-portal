import { NextResponse } from "next/server";

const MEZON_AUTH_URL =
  process.env.MEZON_AUTH_URL || "https://oauth2.mezon.ai/oauth2/auth";
const CLIENT_ID = process.env.MEZON_CLIENT_ID;
const REDIRECT_URI = process.env.MEZON_REDIRECT_URI;

function generateState(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let state = "";
  for (let i = 0; i < 11; i++) {
    state += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return state;
}

export async function GET() {
  if (!CLIENT_ID || !REDIRECT_URI) {
    return NextResponse.json(
      { success: false, error: "OAuth not configured" },
      { status: 500 },
    );
  }

  const state = generateState();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid offline",
    state,
  });

  const response = NextResponse.redirect(`${MEZON_AUTH_URL}?${params.toString()}`);

  // Store state in cookie for verification in callback
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}
