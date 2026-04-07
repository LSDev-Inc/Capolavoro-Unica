import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getAuthUser } from "@/lib/session";
import { sanitizeUser, attachAuthCookie } from "@/lib/auth";
import { createSecurityResetToken, getAppUrl } from "@/lib/security";
import { sendSecurityEmail, sendAccountNotice, resolveLocale } from "@/lib/email";

export const runtime = "nodejs";

function generateTwoFaCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

  const enabled = Boolean(payload?.enabled);
  let twoFactorCode = null;
  const locale = resolveLocale(req.headers.get("accept-language") || "");

  if (enabled) {
    const code = generateTwoFaCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const { token, hash, expires } = createSecurityResetToken();

    user.is2FAEnabled = true;
    user.twoFactorCode = hashedCode;
    user.twoFactorAttempts = 0;
    user.twoFactorLockedUntil = null;
    user.securityResetTokenHash = hash;
    user.securityResetExpires = expires;
    twoFactorCode = code;
    await user.save();

    const resetUrl = `${getAppUrl()}/security-reset?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;
    try {
      await sendSecurityEmail({ to: user.email, resetUrl, locale });
    } catch (error) {
      // Ignore email failures to avoid blocking 2FA enable.
    }
  } else {
    user.is2FAEnabled = false;
    user.twoFactorCode = null;
    user.twoFactorAttempts = 0;
    user.twoFactorLockedUntil = null;
    user.securityResetTokenHash = null;
    user.securityResetExpires = null;
    await user.save();

    try {
      await sendAccountNotice({ to: user.email, type: "twofa_disabled", locale });
    } catch (error) {
      // Ignore email failures
    }
  }

  const response = NextResponse.json({ user: sanitizeUser(user), twoFactorCode });
  return attachAuthCookie(response, user);
}
