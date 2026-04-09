import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { normalizeEmail, isValidEmail } from "@/lib/validators";
import { attachAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 3;
const LOCK_MINUTES = 30;

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
    return NextResponse.json({ error: "Invalid code." }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findOne({ email });
  if (!user || !user.emailLoginCodeHash) {
    return NextResponse.json({ error: "Invalid code." }, { status: 401 });
  }

  if (user.is2FAEnabled) {
    return NextResponse.json({ error: "2FA enabled. Use standard login." }, { status: 409 });
  }

  if (user.emailLoginLockedUntil && user.emailLoginLockedUntil > new Date()) {
    return NextResponse.json({ error: "Login code locked. Try again later." }, { status: 423 });
  }

  if (user.emailLoginExpires && user.emailLoginExpires < new Date()) {
    return NextResponse.json({ error: "Login code expired." }, { status: 400 });
  }

  const matches = await bcrypt.compare(code, user.emailLoginCodeHash);
  if (!matches) {
    user.emailLoginAttempts = (user.emailLoginAttempts || 0) + 1;
    if (user.emailLoginAttempts >= MAX_ATTEMPTS) {
      user.emailLoginLockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      user.emailLoginAttempts = 0;
      user.emailLoginCodeHash = null;
      user.emailLoginExpires = null;
      await user.save();
      return NextResponse.json({ error: "Login code locked. Try again later." }, { status: 423 });
    }

    await user.save();
    return NextResponse.json({ error: "Invalid code." }, { status: 401 });
  }

  user.emailLoginCodeHash = null;
  user.emailLoginExpires = null;
  user.emailLoginAttempts = 0;
  user.emailLoginLockedUntil = null;
  await user.save();

  const response = NextResponse.json({ success: true });
  return attachAuthCookie(response, user);
}
