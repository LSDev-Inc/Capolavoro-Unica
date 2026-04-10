import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { normalizeEmail, isValidEmail } from "@/lib/validators";
import { createSecurityResetToken, hashToken, getAppUrl } from "@/lib/security";
import {
  getEmailErrorResponse,
  sendPasswordResetEmail,
  resolveLocale
} from "@/lib/email";

export const runtime = "nodejs";

const RESET_MINUTES = 20;

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

  const { token } = createSecurityResetToken();
  const hash = hashToken(token);
  const resetExpires = new Date(Date.now() + RESET_MINUTES * 60 * 1000);

  user.passwordResetTokenHash = hash;
  user.passwordResetExpires = resetExpires;
  await user.save();

  const locale = resolveLocale(req.headers.get("accept-language") || "");
  try {
    const resetUrl = `${getAppUrl()}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;
    await sendPasswordResetEmail({ to: user.email, resetUrl, locale });
  } catch (error) {
    console.error("[auth/forgot-password] email failed", {
      email: user.email,
      message: error?.message
    });
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    await user.save();
    const emailError = getEmailErrorResponse(error);
    return NextResponse.json({ error: emailError.error }, { status: emailError.status });
  }

  return NextResponse.json({ sent: true });
}
