import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import {
  normalizeEmail,
  isValidEmail,
  isValidPassword,
  isValidUsername
} from "@/lib/validators";
import {
  signAuthToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
  getCookieOptions,
  sanitizeUser
} from "@/lib/auth";
import { sendVerificationEmail, resolveLocale } from "@/lib/email";

export const runtime = "nodejs";

const VERIFY_MINUTES = 10;

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

  const username = payload?.username?.trim();
  const email = normalizeEmail(payload?.email || "");
  const password = payload?.password || "";

  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Username must be 3-30 characters." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  await dbConnect();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const code = generateVerificationCode();
  const hashedCode = await bcrypt.hash(code, 10);
  const expires = new Date(Date.now() + VERIFY_MINUTES * 60 * 1000);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    emailVerified: false,
    emailVerificationCode: hashedCode,
    emailVerificationExpires: expires,
    is2FAEnabled: false,
    twoFactorCode: null,
    twoFactorAttempts: 0,
    twoFactorLockedUntil: null,
    sessionVersion: 0,
    passwordResetRequired: false,
    securityResetTokenHash: null,
    securityResetExpires: null,
    notes: []
  });

  const locale = resolveLocale(req.headers.get("accept-language") || "");
  const mailResult = await sendVerificationEmail({ to: user.email, code, locale });
  if (!mailResult.sent) {
    await User.deleteOne({ _id: user._id });
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  const response = NextResponse.json({ requiresEmailVerification: true });
  response.cookies.set(
    AUTH_COOKIE_NAME,
    "",
    getCookieOptions(0)
  );

  return response;
}
