import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { normalizeEmail, isValidEmail } from "@/lib/validators";
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
  const mailResult = await sendVerificationEmail({ to: user.email, code, locale });
  if (!mailResult.sent) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
