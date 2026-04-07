import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { normalizeEmail, isValidEmail, isValidPassword } from "@/lib/validators";
import {
  signAuthToken,
  signTwoFaToken,
  AUTH_COOKIE_NAME,
  TWOFA_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
  TWOFA_COOKIE_MAX_AGE,
  getCookieOptions,
  sanitizeUser
} from "@/lib/auth";
import { sendVerificationEmail, resolveLocale } from "@/lib/email";

export const runtime = "nodejs";

const MAX_2FA_ATTEMPTS = 3;
const LOCK_MINUTES = 30;
const VERIFY_MINUTES = 10;

function generateTwoFaCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const email = normalizeEmail(payload?.email || "");
  const password = payload?.password || "";

  if (!isValidEmail(email) || !isValidPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  if (!user.emailVerified) {
    const code = generateVerificationCode();
    const hashedCode = await bcrypt.hash(code, 10);
    user.emailVerificationCode = hashedCode;
    user.emailVerificationExpires = new Date(Date.now() + VERIFY_MINUTES * 60 * 1000);
    await user.save();

    const locale = resolveLocale(req.headers.get("accept-language") || "");
    const mailResult = await sendVerificationEmail({ to: user.email, code, locale });
    if (!mailResult.sent) {
      return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
    }

    return NextResponse.json({ requiresEmailVerification: true });
  }

  if (user.is2FAEnabled) {
    if (user.twoFactorLockedUntil && user.twoFactorLockedUntil > new Date()) {
      return NextResponse.json(
        { error: "2FA locked. Try again later." },
        { status: 423 }
      );
    }

    const code = generateTwoFaCode();
    const hashedCode = await bcrypt.hash(code, 10);
    user.twoFactorCode = hashedCode;
    user.twoFactorAttempts = 0;
    user.twoFactorLockedUntil = null;
    await user.save();

    const twoFaToken = signTwoFaToken(user);
    const response = NextResponse.json({ requires2FA: true, twoFactorCode: code });
    response.cookies.set(
      TWOFA_COOKIE_NAME,
      twoFaToken,
      getCookieOptions(TWOFA_COOKIE_MAX_AGE)
    );
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  const token = signAuthToken(user);
  const response = NextResponse.json({ user: sanitizeUser(user) });
  response.cookies.set(
    AUTH_COOKIE_NAME,
    token,
    getCookieOptions(AUTH_COOKIE_MAX_AGE)
  );
  response.cookies.delete(TWOFA_COOKIE_NAME);
  return response;
}
