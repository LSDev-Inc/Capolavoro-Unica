"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export default function SecurityRevertEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, translateError } = useLanguage();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      const res = await fetch("/api/security/revert-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(translateError(data.error) || t("common.genericError"));
      } else {
        setStatus(t("securityRevert.success"));
        setTimeout(() => {
          router.replace("/");
        }, 1200);
      }
    } catch (err) {
      setError(t("common.genericError"));
    } finally {
      setLoading(false);
    }
  }

  const missing = !token;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        <div className="glass w-full rounded-3xl p-8 shadow-soft fade-up">
          <h1 className="font-display text-3xl text-white">{t("securityRevert.title")}</h1>
          <p className="mt-2 text-sm text-muted">{t("securityRevert.subtitle")}</p>

          {missing ? (
            <p className="mt-6 text-sm text-red-300">{t("securityRevert.missing")}</p>
          ) : (
            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
              <p className="text-sm text-muted">{t("securityRevert.confirm")}</p>

              {error && <p className="text-sm text-red-300">{error}</p>}
              {status && <p className="text-sm text-emerald-300">{status}</p>}

              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-highlight px-6 py-3 text-sm font-semibold text-ink shadow-soft transition hover:translate-y-[-1px] disabled:opacity-60"
              >
                {loading ? t("securityRevert.loading") : t("securityRevert.button")}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
