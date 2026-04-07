import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/session";
import { sanitizeUser, attachAuthCookie } from "@/lib/auth";
import { isValidUsername } from "@/lib/validators";

export const runtime = "nodejs";

export async function PATCH(req) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const username = payload?.username?.trim();
  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Username must be 3-30 characters." }, { status: 400 });
  }

  user.username = username;
  await user.save();

  const response = NextResponse.json({ user: sanitizeUser(user) });
  return attachAuthCookie(response, user);
}
