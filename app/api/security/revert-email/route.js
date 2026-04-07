import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { hashToken } from "@/lib/security";
import { AUTH_COOKIE_NAME, TWOFA_COOKIE_NAME, getCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const token = payload?.token || "";
  if (!token) {
    return NextResponse.json({ error: "Email rollback token invalid." }, { status: 400 });
  }

  await dbConnect();
  const hashedToken = hashToken(token);
  const user = await User.findOne({ emailRollbackTokenHash: hashedToken });
  if (!user || !user.emailRollbackPrevious) {
    return NextResponse.json({ error: "Email rollback token invalid." }, { status: 400 });
  }

  if (user.emailRollbackExpires && user.emailRollbackExpires < new Date()) {
    return NextResponse.json({ error: "Email rollback token expired." }, { status: 400 });
  }

  const rollbackEmail = user.emailRollbackPrevious;
  const existing = await User.findOne({ email: rollbackEmail, _id: { $ne: user._id } });
  if (existing) {
    return NextResponse.json({ error: "Email rollback token invalid." }, { status: 400 });
  }

  user.email = rollbackEmail;
  user.emailRollbackPrevious = null;
  user.emailRollbackTokenHash = null;
  user.emailRollbackExpires = null;
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save();

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", getCookieOptions(0));
  response.cookies.set(TWOFA_COOKIE_NAME, "", getCookieOptions(0));
  return response;
}
