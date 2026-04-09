import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const secret = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

async function verifyJwt(token) {
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const twofa = req.cookies.get("twofa")?.value;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/login-email");
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/settings");
  const isVerifyPage = pathname.startsWith("/verify-2fa");

  if (isProtected) {
    const payload = token ? await verifyJwt(token) : null;
    if (!payload) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  if (isAuthPage) {
    const payload = token ? await verifyJwt(token) : null;
    if (payload) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  if (isVerifyPage) {
    const authPayload = token ? await verifyJwt(token) : null;
    if (authPayload) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    const payload = twofa ? await verifyJwt(twofa) : null;
    if (!payload || payload.purpose !== "2fa") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/verify-2fa",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/login-email"
  ]
};
