import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getAuthUser } from "@/lib/session";
import { isValidPassword } from "@/lib/validators";
import { attachAuthCookie } from "@/lib/auth";
import { sendAccountNotice, resolveLocale } from "@/lib/email";
import { createSecurityResetToken, getAppUrl } from "@/lib/security";

export const runtime = "nodejs";

export async function PATCH(req) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const oldPassword = payload?.oldPassword || "";
  const newPassword = payload?.newPassword || "";

  if (!isValidPassword(newPassword)) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const matches = await bcrypt.compare(oldPassword, user.password);
  if (!matches) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  const { token, hash, expires } = createSecurityResetToken();
  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetRequired = false;
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  user.securityResetTokenHash = hash;
  user.securityResetExpires = expires;
  await user.save();

  const locale = resolveLocale(req.headers.get("accept-language") || "");
  try {
    const resetUrl = `${getAppUrl()}/security-reset?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;
    await sendAccountNotice({
      to: user.email,
      type: "password_changed",
      locale,
      meta: { actionUrl: resetUrl }
    });
  } catch (error) {
    // Ignore email failures
  }

  const response = NextResponse.json({ message: "Password updated." });
  return attachAuthCookie(response, user);
}
