import crypto from "crypto";

export function createSecurityResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, hash, expires };
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}
