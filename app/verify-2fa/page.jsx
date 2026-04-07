"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export default function VerifyTwoFaPage() {
  const router = useRouter();
  const { t, translateError } = useLanguage();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeHint, setCodeHint] = useState("");

  useEffect(() => {
    const stored = window.sessionStorage.getItem("twofaCode");
    if (stored) {
      setCodeHint(stored);
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(translateError(data.error) || t("common.genericError"));
      } else {
        window.sessionStorage.removeItem("twofaCode");
        router.push("/dashboard");
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
        <h1 className="font-display text-3xl text-white">{t("verify.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("verify.subtitle")}</p>

        {codeHint && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase text-muted">{t("verify.codeTitle")}</p>
            <p className="mt-1 font-display text-xl text-white">
              {t("verify.codeHint", { code: codeHint })}
            </p>
          </div>
        )}

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="text-sm text-muted">
            {t("verify.codeLabel")}
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

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-highlight px-6 py-3 text-sm font-semibold text-ink shadow-soft transition hover:translate-y-[-1px] disabled:opacity-60"
          >
            {loading ? t("verify.buttonLoading") : t("verify.button")}
          </button>
        </form>
        </div>
      </div>
    </main>
  );
}
