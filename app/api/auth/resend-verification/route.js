import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { normalizeEmail, isValidEmail } from "@/lib/validators";
import {
  getEmailErrorResponse,
  sendVerificationEmail,
  resolveLocale
} from "@/lib/email";

export const runtime = "nodejs";

const VERIFY_MINUTES = 10;

function generateVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const email = normalizeEmail(payload?.email || "");
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findOne({ email });
  if (!user || user.emailVerified) {
    return NextResponse.json({ sent: true });
  }

  const code = generateVerificationCode();
  const hashedCode = await bcrypt.hash(code, 10);
  user.emailVerificationCode = hashedCode;
  user.emailVerificationExpires = new Date(Date.now() + VERIFY_MINUTES * 60 * 1000);
  await user.save();

  const locale = resolveLocale(req.headers.get("accept-language") || "");
  try {
    await sendVerificationEmail({ to: user.email, code, locale });
  } catch (error) {
    console.error("[auth/resend-verification] email failed", {
      email: user.email,
      message: error?.message
    });
    const emailError = getEmailErrorResponse(error);
    return NextResponse.json({ error: emailError.error }, { status: emailError.status });
  }

  return NextResponse.json({ sent: true });
}
