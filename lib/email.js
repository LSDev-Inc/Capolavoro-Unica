import nodemailer from "nodemailer";

const APP_TIMEZONE = process.env.APP_TIMEZONE || "Europe/Rome";
const BRAND_NAME = "Capolavoro Unica";

class EmailError extends Error {
  constructor(message, code, cause) {
    super(message);
    this.name = "EmailError";
    this.code = code;
    this.cause = cause;
  }
}

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

function getEmailConfig() {
  const host = normalizeEnvValue(process.env.SMTP_HOST);
  const portValue = normalizeEnvValue(process.env.SMTP_PORT || "587");
  const port = Number.parseInt(portValue, 10);
  const user = normalizeEnvValue(process.env.SMTP_USER);
  const rawPass = normalizeEnvValue(process.env.SMTP_PASS || "");
  const pass = host?.toLowerCase().includes("gmail")
    ? rawPass.replace(/\s+/g, "")
    : rawPass;
  const from = normalizeEnvValue(process.env.SMTP_FROM) || user;

  if (!host || !user || !pass || !Number.isInteger(port)) {
    throw new EmailError("Email service not configured.", "not_configured");
  }

  return { host, port, user, pass, from };
}

function createTransporter() {
  const config = getEmailConfig();

  return {
    transporter: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      requireTLS: config.port !== 465,
      auth: { user: config.user, pass: config.pass }
    }),
    from: config.from
  };
}

async function sendEmail({ to, subject, text, html }) {
  const { transporter, from } = createTransporter();

  try {
    await transporter.sendMail({ from, to, subject, text, html });
    return { sent: true };
  } catch (error) {
    console.error("[email] send failed", {
      message: error?.message,
      code: error?.code,
      command: error?.command,
      responseCode: error?.responseCode,
      response: error?.response
    });

    throw new EmailError("Unable to send email.", "send_failed", error);
  }
}

export function getEmailErrorResponse(error) {
  if (error instanceof EmailError && error.code === "not_configured") {
    return { error: "Email service not configured.", status: 500 };
  }

  return { error: "Unable to send email.", status: 502 };
}

export function resolveLocale(acceptLanguage = "") {
  return acceptLanguage.toLowerCase().includes("it") ? "it" : "en";
}

function formatDateTime(locale = "it") {
  const language = locale === "it" ? "it-IT" : "en-US";

  try {
    return new Intl.DateTimeFormat(language, {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: APP_TIMEZONE
    }).format(new Date());
  } catch (error) {
    return new Date().toLocaleString(language);
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function buildEmailTemplate({ locale, title, intro, content, cta, footnote, preheader }) {
  const time = formatDateTime(locale);
  const timeLabel = locale === "it" ? "Data e ora" : "Date & time";
  const footer =
    locale === "it"
      ? `${BRAND_NAME} - Email generata automaticamente, non rispondere.`
      : `${BRAND_NAME} - This is an automated email, please do not reply.`;
  const button =
    cta && cta.url
      ? `<a href="${escapeAttribute(
          cta.url
        )}" style="display:inline-block;margin-top:18px;padding:12px 22px;border-radius:999px;background:#4b7cff;color:#0b0d12;font-weight:600;text-decoration:none;">${escapeHtml(
          cta.label
        )}</a>`
      : "";
  const fallback =
    cta && cta.url
      ? `<p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#9aa4b2;">
          ${escapeHtml(cta.fallback || "")}<br />
          <a href="${escapeAttribute(cta.url)}" style="color:#7fb2ff;word-break:break-all;">${escapeHtml(
          cta.url
        )}</a>
        </p>`
      : "";

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#0b0d12;color:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(
      preheader || ""
    )}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0d12;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#121622;border-radius:24px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 20px 60px rgba(0,0,0,0.35);">
            <tr>
              <td style="padding:28px;">
                <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#9aa4b2;">${BRAND_NAME}</div>
                <h1 style="margin:12px 0 8px;font-size:24px;line-height:1.2;color:#ffffff;">${escapeHtml(
                  title
                )}</h1>
                ${
                  intro
                    ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#b7c0cc;">${escapeHtml(
                        intro
                      )}</p>`
                    : ""
                }
                ${content}
                ${button}
                ${fallback}
                <div style="margin-top:18px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.04);font-size:12px;line-height:1.5;color:#9aa4b2;">
                  ${escapeHtml(timeLabel)}: ${escapeHtml(time)}
                </div>
                ${
                  footnote
                    ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#9aa4b2;">${escapeHtml(
                        footnote
                      )}</p>`
                    : ""
                }
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:11px;line-height:1.5;color:#6f7a88;">${escapeHtml(
            footer
          )}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendSecurityEmail({ to, resetUrl, locale = "it" }) {
  const time = formatDateTime(locale);
  const subject =
    locale === "it"
      ? "2FA attivata sul tuo account"
      : "2FA enabled on your account";
  const text =
    locale === "it"
      ? `Ciao,\n\nHai appena attivato la 2FA.\nData e ora: ${time}\n\nSe non sei stato tu, apri questo link per mettere in sicurezza l'account:\n${resetUrl}\n\nGrazie.`
      : `Hello,\n\n2FA was just enabled.\nDate & time: ${time}\n\nIf this wasn't you, open this link to secure your account:\n${resetUrl}\n\nThanks.`;
  const intro =
    locale === "it"
      ? "Hai appena attivato l'autenticazione a due fattori sul tuo account."
      : "Two-factor authentication was just enabled on your account.";
  const content = `
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#e5e9f2;">
      ${
        locale === "it"
          ? "Se non sei stato tu, usa il pulsante qui sotto per mettere subito in sicurezza l'account."
          : "If this wasn't you, use the button below to secure your account immediately."
      }
    </p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#e5e9f2;">
      ${
        locale === "it"
          ? "Il link disattivera' la 2FA e ti chiedera' di impostare una nuova password."
          : "The link will disable 2FA and ask you to set a new password."
      }
    </p>
  `;
  const html = buildEmailTemplate({
    locale,
    title: subject,
    intro,
    content,
    cta: {
      url: resetUrl,
      label: locale === "it" ? "Metti in sicurezza" : "Secure account",
      fallback:
        locale === "it"
          ? "Se il pulsante non funziona, copia il link:"
          : "If the button doesn't work, copy:"
    },
    footnote:
      locale === "it"
        ? "Se riconosci questa azione, puoi ignorare l'email."
        : "If you recognize this action, you can safely ignore this email.",
    preheader:
      locale === "it"
        ? "2FA attivata. Verifica che sia stato tu."
        : "2FA enabled. Make sure it was you."
  });

  return sendEmail({ to, subject, text, html });
}

export async function sendPasswordResetEmail({ to, resetUrl, locale = "it" }) {
  const subject = locale === "it" ? "Reset della password" : "Password reset";
  const text =
    locale === "it"
      ? `Ciao,\n\nHai richiesto un reset della password.\nApri questo link per impostare una nuova password:\n${resetUrl}\n\nSe non sei stato tu, ignora questa email.`
      : `Hello,\n\nYou requested a password reset.\nOpen this link to set a new password:\n${resetUrl}\n\nIf this wasn't you, you can ignore this email.`;
  const intro =
    locale === "it"
      ? "Hai richiesto il reset della password."
      : "You requested a password reset.";
  const content = `
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#e5e9f2;">
      ${
        locale === "it"
          ? "Usa il pulsante qui sotto per impostare una nuova password."
          : "Use the button below to set a new password."
      }
    </p>
  `;
  const html = buildEmailTemplate({
    locale,
    title: subject,
    intro,
    content,
    cta: {
      url: resetUrl,
      label: locale === "it" ? "Imposta nuova password" : "Set new password",
      fallback:
        locale === "it"
          ? "Se il pulsante non funziona, copia il link:"
          : "If the button doesn't work, copy:"
    },
    preheader:
      locale === "it"
        ? "Reset della password richiesto."
        : "Password reset requested."
  });

  return sendEmail({ to, subject, text, html });
}

export async function sendLoginCodeEmail({ to, code, locale = "it" }) {
  const time = formatDateTime(locale);
  const subject =
    locale === "it" ? "Codice accesso rapido" : "Secure login code";
  const text =
    locale === "it"
      ? `Ciao,\n\nUsa questo codice per accedere.\nData e ora: ${time}\n\nCodice: ${code}\n\nIl codice scade tra 10 minuti.`
      : `Hello,\n\nUse this code to sign in.\nDate & time: ${time}\n\nCode: ${code}\n\nThe code expires in 10 minutes.`;
  const intro =
    locale === "it"
      ? "Usa questo codice per accedere in modo protetto."
      : "Use this code to securely sign in.";
  const content = `
    <div style="margin:16px 0;padding:18px;border-radius:18px;background:#0d111a;border:1px solid rgba(255,255,255,0.08);text-align:center;">
      <div style="font-size:26px;letter-spacing:6px;font-weight:700;color:#ffffff;">${escapeHtml(
        code
      )}</div>
    </div>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#e5e9f2;">
      ${
        locale === "it"
          ? "Il codice scade tra 10 minuti."
          : "The code expires in 10 minutes."
      }
    </p>
  `;
  const html = buildEmailTemplate({
    locale,
    title: subject,
    intro,
    content,
    preheader:
      locale === "it"
        ? "Codice temporaneo per accesso protetto."
        : "Temporary code for secure sign-in."
  });

  return sendEmail({ to, subject, text, html });
}

export async function sendVerificationEmail({ to, code, locale = "it" }) {
  const time = formatDateTime(locale);
  const subject =
    locale === "it" ? "Verifica la tua email" : "Verify your email";
  const text =
    locale === "it"
      ? `Ciao,\n\nUsa questo codice per verificare la tua email.\nData e ora: ${time}\n\nCodice: ${code}\n\nIl codice scade tra 10 minuti.`
      : `Hello,\n\nUse this code to verify your email.\nDate & time: ${time}\n\nCode: ${code}\n\nThe code expires in 10 minutes.`;
  const intro =
    locale === "it"
      ? "Usa il codice seguente per verificare la tua email."
      : "Use the code below to verify your email.";
  const content = `
    <div style="margin:16px 0;padding:18px;border-radius:18px;background:#0d111a;border:1px solid rgba(255,255,255,0.08);text-align:center;">
      <div style="font-size:26px;letter-spacing:6px;font-weight:700;color:#ffffff;">${escapeHtml(
        code
      )}</div>
    </div>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#e5e9f2;">
      ${
        locale === "it"
          ? "Il codice scade tra 10 minuti."
          : "The code expires in 10 minutes."
      }
    </p>
  `;
  const html = buildEmailTemplate({
    locale,
    title: subject,
    intro,
    content,
    preheader:
      locale === "it"
        ? "Conferma la tua email con il codice di verifica."
        : "Confirm your email with the verification code.",
    footnote:
      locale === "it"
        ? "Se non hai richiesto la verifica, ignora questa email."
        : "If you didn't request this, you can ignore this email."
  });

  return sendEmail({ to, subject, text, html });
}

export async function sendAccountNotice({ to, type, locale = "it", meta = {} }) {
  const time = formatDateTime(locale);
  const actionUrl = meta.actionUrl;

  let subject;
  let text;
  let html;

  if (type === "password_changed") {
    subject = locale === "it" ? "Password aggiornata" : "Password changed";
    text =
      locale === "it"
        ? `La password del tuo account e' stata modificata.\nData e ora: ${time}\n\n${
            actionUrl
              ? `Se non sei stato tu, usa questo link per impostare una nuova password:\n${actionUrl}`
              : "Se non sei stato tu, cambia subito la password."
          }`
        : `Your account password was changed.\nDate & time: ${time}\n\n${
            actionUrl
              ? `If this wasn't you, use this link to set a new password:\n${actionUrl}`
              : "If this wasn't you, reset your password immediately."
          }`;

    const intro =
      locale === "it"
        ? "La password del tuo account e' stata aggiornata."
        : "Your account password was updated.";
    const actionCopy = actionUrl
      ? locale === "it"
        ? "Se non sei stato tu, usa il pulsante qui sotto per impostare una nuova password."
        : "If this wasn't you, use the button below to set a new password."
      : locale === "it"
      ? "Se non sei stato tu, cambia subito la password e verifica la sicurezza dell'account."
      : "If this wasn't you, reset your password immediately and review your account security.";
    const content = `
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#e5e9f2;">
        ${actionCopy}
      </p>
    `;
    html = buildEmailTemplate({
      locale,
      title: subject,
      intro,
      content,
      cta: actionUrl
        ? {
            url: actionUrl,
            label: locale === "it" ? "Cambia password" : "Change password",
            fallback:
              locale === "it"
                ? "Se il pulsante non funziona, copia il link:"
                : "If the button doesn't work, copy:"
          }
        : null,
      preheader:
        locale === "it"
          ? "La password del tuo account e' stata cambiata."
          : "Your account password was changed."
    });
  }

  if (type === "email_changed") {
    const oldEmail = meta.oldEmail || "";
    const newEmail = meta.newEmail || "";

    subject = locale === "it" ? "Email aggiornata" : "Email updated";
    text =
      locale === "it"
        ? `L'email dell'account e' stata cambiata.\nData e ora: ${time}\n\nVecchia email: ${oldEmail}\nNuova email: ${newEmail}\n\n${
            actionUrl
              ? `Se non sei stato tu, usa questo link per ripristinare la vecchia email:\n${actionUrl}`
              : "Se non sei stato tu, cambia subito la password."
          }`
        : `Account email was changed.\nDate & time: ${time}\n\nOld email: ${oldEmail}\nNew email: ${newEmail}\n\n${
            actionUrl
              ? `If this wasn't you, use this link to restore the previous email:\n${actionUrl}`
              : "If this wasn't you, reset your password immediately."
          }`;

    const intro =
      locale === "it"
        ? "L'email del tuo account e' stata aggiornata."
        : "Your account email was updated.";
    const content = `
      <div style="margin:12px 0 16px;padding:14px;border-radius:16px;background:#0d111a;border:1px solid rgba(255,255,255,0.08);">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#9aa4b2;">
          ${locale === "it" ? "Dettagli" : "Details"}
        </p>
        <p style="margin:0;font-size:14px;color:#e5e9f2;">
          ${locale === "it" ? "Vecchia email" : "Old email"}: <strong>${escapeHtml(
            oldEmail
          )}</strong><br />
          ${locale === "it" ? "Nuova email" : "New email"}: <strong>${escapeHtml(newEmail)}</strong>
        </p>
      </div>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#e5e9f2;">
        ${
          actionUrl
            ? locale === "it"
              ? "Se non sei stato tu, usa il pulsante qui sotto per ripristinare la vecchia email."
              : "If this wasn't you, use the button below to restore the previous email."
            : locale === "it"
            ? "Se non sei stato tu, cambia subito la password."
            : "If this wasn't you, reset your password immediately."
        }
      </p>
    `;
    html = buildEmailTemplate({
      locale,
      title: subject,
      intro,
      content,
      cta: actionUrl
        ? {
            url: actionUrl,
            label: locale === "it" ? "Ripristina email" : "Restore email",
            fallback:
              locale === "it"
                ? "Se il pulsante non funziona, copia il link:"
                : "If the button doesn't work, copy:"
          }
        : null,
      preheader:
        locale === "it" ? "La tua email e' stata cambiata." : "Your email was changed."
    });
  }

  if (type === "twofa_disabled") {
    subject = locale === "it" ? "2FA disattivata" : "2FA disabled";
    text =
      locale === "it"
        ? `La 2FA e' stata disattivata.\nData e ora: ${time}\n\nSe non sei stato tu, cambia subito la password.`
        : `2FA was disabled.\nDate & time: ${time}\n\nIf this wasn't you, reset your password immediately.`;

    const intro =
      locale === "it"
        ? "L'autenticazione a due fattori e' stata disattivata."
        : "Two-factor authentication was disabled.";
    const content = `
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#e5e9f2;">
        ${
          locale === "it"
            ? "Se non sei stato tu, cambia subito la password."
            : "If this wasn't you, reset your password immediately."
        }
      </p>
    `;
    html = buildEmailTemplate({
      locale,
      title: subject,
      intro,
      content,
      preheader:
        locale === "it" ? "La 2FA e' stata disattivata." : "2FA was disabled on your account."
    });
  }

  if (!subject) {
    return { sent: false, reason: "invalid_type" };
  }

  return sendEmail({ to, subject, text, html });
}
