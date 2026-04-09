"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export default function LoginEmailPage() {
  const router = useRouter();
  const { t, translateError } = useLanguage();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("request");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/request-login-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(translateError(data.error) || t("common.genericError"));
      } else {
        setStatus(t("loginEmail.sent"));
        setStep("verify");
      }
    } catch (err) {
      setError(t("common.genericError"));
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-login-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(translateError(data.error) || t("common.genericError"));
      } else {
        setStatus(t("loginEmail.success"));
        setTimeout(() => {
          router.push("/dashboard");
        }, 700);
      }
    } catch (err) {
      setError(t("common.genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        <div className="glass w-full rounded-3xl p-8 shadow-soft fade-up">
        <h1 className="font-display text-3xl text-white">{t("loginEmail.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("loginEmail.subtitle")}</p>

        {step === "request" ? (
          <form className="mt-8 flex flex-col gap-4" onSubmit={requestCode}>
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

            {error && <p className="text-sm text-red-300">{error}</p>}
            {status && <p className="text-sm text-emerald-300">{status}</p>}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px] disabled:opacity-60"
            >
              {loading ? t("loginEmail.buttonLoading") : t("loginEmail.button")}
            </button>
          </form>
        ) : (
          <form className="mt-8 flex flex-col gap-4" onSubmit={verifyCode}>
            <label className="text-sm text-muted">
              {t("loginEmail.codeLabel")}
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
              {loading ? t("loginEmail.verifyLoading") : t("loginEmail.verify")}
            </button>

            <button
              type="button"
              onClick={requestCode}
              className="mt-2 w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("loginEmail.resend")}
            </button>
          </form>
        )}
        </div>
      </div>
    </main>
  );
}
