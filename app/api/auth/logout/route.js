import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  TWOFA_COOKIE_NAME,
  getCookieOptions
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out." });
  response.cookies.set(AUTH_COOKIE_NAME, "", getCookieOptions(0));
  response.cookies.set(TWOFA_COOKIE_NAME, "", getCookieOptions(0));
  return response;
}
