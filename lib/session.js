import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth";

export async function getAuthUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    await dbConnect();
    const user = await User.findById(payload.sub);
    if (!user) return null;
    const sessionVersion = user.sessionVersion || 0;
    if (payload.sv !== sessionVersion) return null;
    return user;
  } catch (error) {
    return null;
  }
}
