"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { t, translateError } = useLanguage();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

  useEffect(() => {
    const stored = window.sessionStorage.getItem("verifyEmail");
    if (stored) {
      setEmail(stored);
    }
  }, []);

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(translateError(data.error) || t("common.genericError"));
      } else {
        window.sessionStorage.removeItem("verifyEmail");
        setStatus(t("verifyEmail.success"));
        router.push("/dashboard");
      }
    } catch (err) {
      setError(t("common.genericError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendStatus("");
    setError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(translateError(data.error) || t("common.genericError"));
      } else {
        setResendStatus(t("verifyEmail.resent"));
      }
    } catch (err) {
      setError(t("common.genericError"));
    }
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        <div className="glass w-full rounded-3xl p-8 shadow-soft fade-up">
        <h1 className="font-display text-3xl text-white">{t("verifyEmail.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("verifyEmail.subtitle")}</p>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleVerify}>
          <label className="text-sm text-muted">
            {t("common.email")}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
              required
            />
          </label>
          <label className="text-sm text-muted">
            {t("verifyEmail.codeLabel")}
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
              placeholder="123456"
              required
            />
          </label>

          {error && <p className="text-sm text-red-300">{error}</p>}
          {status && <p className="text-sm text-emerald-300">{status}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-highlight px-6 py-3 text-sm font-semibold text-ink shadow-soft transition hover:translate-y-[-1px] disabled:opacity-60"
          >
            {loading ? t("verifyEmail.buttonLoading") : t("verifyEmail.button")}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          className="mt-6 w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {t("verifyEmail.resend")}
        </button>
        {resendStatus && <p className="mt-2 text-xs text-muted">{resendStatus}</p>}
        </div>
      </div>
    </main>
  );
}
