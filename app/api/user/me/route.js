import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/session";
import { sanitizeUser, attachAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const response = NextResponse.json({ user: sanitizeUser(user) });
  return attachAuthCookie(response, user);
}
