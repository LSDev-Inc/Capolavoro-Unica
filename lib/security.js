import crypto from "crypto";

function normalizeEnvValue(value = "") {
  const trimmed = String(value).trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

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
  const appUrl = normalizeEnvValue(process.env.APP_URL);
  if (appUrl) {
    return appUrl;
  }

  const vercelUrl = normalizeEnvValue(
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  );

  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}
