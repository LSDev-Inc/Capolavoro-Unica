"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { t, translateError } = useLanguage();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(translateError(data.error) || t("common.genericError"));
      } else if (data.requiresEmailVerification) {
        window.sessionStorage.setItem("verifyEmail", email);
        router.push("/verify-email");
      } else {
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
        <h1 className="font-display text-3xl text-white">{t("register.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("register.subtitle")}</p>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="text-sm text-muted">
            {t("common.username")}
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
              required
            />
          </label>
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
            {t("common.password")}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
              required
            />
          </label>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px] disabled:opacity-60"
          >
            {loading ? t("register.buttonLoading") : t("register.button")}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          {t("register.already")} {" "}
          <Link href="/login" className="text-white underline hover:no-underline hover:text-green-400">
            {t("register.login")}
          </Link>
        </p>
        </div>
      </div>
    </main>
  );
}
