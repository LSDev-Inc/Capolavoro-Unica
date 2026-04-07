import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { normalizeEmail, isValidEmail } from "@/lib/validators";
import {
  signAuthToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
  getCookieOptions,
  sanitizeUser
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const email = normalizeEmail(payload?.email || "");
  const code = payload?.code?.trim();

  if (!isValidEmail(email) || !/^\d{6}$/.test(code || "")) {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findOne({ email });
  if (!user || !user.emailVerificationCode) {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
    return NextResponse.json({ error: "Verification code expired." }, { status: 400 });
  }

  const matches = await bcrypt.compare(code, user.emailVerificationCode);
  if (!matches) {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  user.emailVerified = true;
  user.emailVerificationCode = null;
  user.emailVerificationExpires = null;
  await user.save();

  const token = signAuthToken(user);
  const response = NextResponse.json({ user: sanitizeUser(user) });
  response.cookies.set(
    AUTH_COOKIE_NAME,
    token,
    getCookieOptions(AUTH_COOKIE_MAX_AGE)
  );
  return response;
}
