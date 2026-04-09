import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { normalizeEmail, isValidEmail, isValidPassword } from "@/lib/validators";
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

  const token = payload?.token;
  const email = normalizeEmail(payload?.email || "");
  const newPassword = payload?.newPassword || "";

  if (!token || !isValidEmail(email)) {
    return NextResponse.json({ error: "Password reset token invalid." }, { status: 400 });
  }

  if (!isValidPassword(newPassword)) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findOne({ email });
  if (!user || !user.passwordResetTokenHash) {
    return NextResponse.json({ error: "Password reset token invalid." }, { status: 400 });
  }

  if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
    return NextResponse.json({ error: "Password reset token expired." }, { status: 400 });
  }

  const hashedToken = hashToken(token);
  if (hashedToken !== user.passwordResetTokenHash) {
    return NextResponse.json({ error: "Password reset token invalid." }, { status: 400 });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetRequired = false;
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save();

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", getCookieOptions(0));
  response.cookies.set(TWOFA_COOKIE_NAME, "", getCookieOptions(0));
  return response;
}
