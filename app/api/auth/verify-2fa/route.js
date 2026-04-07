import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import {
  signAuthToken,
  AUTH_COOKIE_NAME,
  TWOFA_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
  getCookieOptions,
  sanitizeUser,
  verifyToken
} from "@/lib/auth";

export const runtime = "nodejs";

const MAX_2FA_ATTEMPTS = 3;
const LOCK_MINUTES = 30;

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const code = payload?.code?.trim();
  if (!/^\d{6}$/.test(code || "")) {
    return NextResponse.json({ error: "Invalid code." }, { status: 400 });
  }

  const cookieStore = cookies();
  const token = cookieStore.get(TWOFA_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Two-factor session expired." }, { status: 401 });
  }

  let payloadToken;
  try {
    payloadToken = verifyToken(token);
  } catch (error) {
    return NextResponse.json({ error: "Two-factor session expired." }, { status: 401 });
  }

  if (payloadToken.purpose !== "2fa") {
    return NextResponse.json({ error: "Invalid two-factor session." }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(payloadToken.sub);
  if (!user || !user.twoFactorCode) {
    return NextResponse.json({ error: "Invalid two-factor code." }, { status: 401 });
  }

  if (user.twoFactorLockedUntil && user.twoFactorLockedUntil > new Date()) {
    const response = NextResponse.json(
      { error: "2FA locked. Try again later." },
      { status: 423 }
    );
    response.cookies.delete(TWOFA_COOKIE_NAME);
    return response;
  }

  const matches = await bcrypt.compare(code, user.twoFactorCode);
  if (!matches) {
    user.twoFactorAttempts = (user.twoFactorAttempts || 0) + 1;
    if (user.twoFactorAttempts >= MAX_2FA_ATTEMPTS) {
      user.twoFactorLockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      user.twoFactorAttempts = 0;
      user.twoFactorCode = null;
      await user.save();
      const response = NextResponse.json(
        { error: "2FA locked. Try again later." },
        { status: 423 }
      );
      response.cookies.delete(TWOFA_COOKIE_NAME);
      return response;
    }

    await user.save();
    return NextResponse.json({ error: "Invalid two-factor code." }, { status: 401 });
  }

  user.twoFactorCode = null;
  user.twoFactorAttempts = 0;
  user.twoFactorLockedUntil = null;
  await user.save();

  const authToken = signAuthToken(user);
  const response = NextResponse.json({ user: sanitizeUser(user) });
  response.cookies.set(
    AUTH_COOKIE_NAME,
    authToken,
    getCookieOptions(AUTH_COOKIE_MAX_AGE)
  );
  response.cookies.delete(TWOFA_COOKIE_NAME);
  return response;
}
