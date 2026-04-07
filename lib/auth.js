import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const TOKEN_MAX_AGE_SECONDS = parseInt(
  process.env.JWT_MAX_AGE_SECONDS || "604800",
  10
);
const TWOFA_EXPIRES_MINUTES = parseInt(
  process.env.TWOFA_EXPIRES_MINUTES || "10",
  10
);

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
      sv: user.sessionVersion || 0
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function signTwoFaToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      purpose: "2fa"
    },
    JWT_SECRET,
    { expiresIn: `${TWOFA_EXPIRES_MINUTES}m` }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getCookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds
  };
}

export const AUTH_COOKIE_NAME = "token";
export const TWOFA_COOKIE_NAME = "twofa";
export const AUTH_COOKIE_MAX_AGE = TOKEN_MAX_AGE_SECONDS;
export const TWOFA_COOKIE_MAX_AGE = TWOFA_EXPIRES_MINUTES * 60;

export function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    is2FAEnabled: user.is2FAEnabled,
    passwordResetRequired: user.passwordResetRequired || false
  };
}

export function attachAuthCookie(response, user) {
  const token = signAuthToken(user);
  response.cookies.set(
    AUTH_COOKIE_NAME,
    token,
    getCookieOptions(AUTH_COOKIE_MAX_AGE)
  );
  return response;
}
