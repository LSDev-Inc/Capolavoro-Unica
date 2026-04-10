import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/session";
import { sanitizeUser, attachAuthCookie } from "@/lib/auth";
import { normalizeEmail, isValidEmail } from "@/lib/validators";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
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

  const email = normalizeEmail(payload?.email || "");
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  await dbConnect();
  const existing = await User.findOne({ email, _id: { $ne: user._id } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const oldEmail = user.email;
  const { token, hash, expires } = createSecurityResetToken();
  user.email = email;
  user.emailRollbackPrevious = oldEmail;
  user.emailRollbackTokenHash = hash;
  user.emailRollbackExpires = expires;
  await user.save();

  const locale = resolveLocale(req.headers.get("accept-language") || "");
  try {
    const rollbackUrl = `${getAppUrl()}/security-revert-email?token=${token}`;
    await sendAccountNotice({
      to: oldEmail,
      type: "email_changed",
      locale,
      meta: { oldEmail, newEmail: email, actionUrl: rollbackUrl }
    });
    if (email !== oldEmail) {
      await sendAccountNotice({
        to: email,
        type: "email_changed",
        locale,
        meta: { oldEmail, newEmail: email }
      });
    }
  } catch (error) {
    console.error("[user/email] notice email failed", {
      email,
      oldEmail,
      message: error?.message
    });
  }

  const response = NextResponse.json({ user: sanitizeUser(user) });
  return attachAuthCookie(response, user);
}
