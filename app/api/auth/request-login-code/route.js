import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { normalizeEmail, isValidEmail } from "@/lib/validators";
import { sendLoginCodeEmail, resolveLocale } from "@/lib/email";

export const runtime = "nodejs";

const CODE_MINUTES = 10;

function generateLoginCode() {
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
  if (!user) {
    return NextResponse.json({ sent: true });
  }

  if (!user.emailVerified) {
    return NextResponse.json({ error: "Email not verified." }, { status: 403 });
  }

  if (user.is2FAEnabled) {
    return NextResponse.json({ error: "2FA enabled. Use standard login." }, { status: 409 });
  }

  if (user.emailLoginLockedUntil && user.emailLoginLockedUntil > new Date()) {
    return NextResponse.json({ error: "Login code locked. Try again later." }, { status: 423 });
  }

  const code = generateLoginCode();
  const hashedCode = await bcrypt.hash(code, 10);
  user.emailLoginCodeHash = hashedCode;
  user.emailLoginExpires = new Date(Date.now() + CODE_MINUTES * 60 * 1000);
  user.emailLoginAttempts = 0;
  user.emailLoginLockedUntil = null;
  await user.save();

  const locale = resolveLocale(req.headers.get("accept-language") || "");
  try {
    await sendLoginCodeEmail({ to: user.email, code, locale });
  } catch (error) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
