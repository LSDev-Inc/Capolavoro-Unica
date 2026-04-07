"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export default function TopNav({ username }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="relative z-[100] flex flex-col gap-4 overflow-visible rounded-2xl border border-white/10 bg-slate/80 px-6 py-4 shadow-soft fade-up sm:flex-row sm:items-center sm:justify-between">
      <Link href="/dashboard" className="font-display text-lg tracking-wide">
        {t("nav.brand")}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <LanguageToggle />
        <div className="relative z-[110]">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 transition hover:bg-white/10"
          >
            <span className="text-muted">{t("nav.greeting")},</span> {username || t("nav.student")}
          </button>
          {open && (
            <div
              className="absolute right-0 z-[120] mt-3 w-56 rounded-2xl border border-white/10 bg-ink/95 p-2 shadow-soft fade-up"
              onMouseLeave={() => setOpen(false)}
            >
              <Link href="/settings" className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5">
                {t("nav.settings")}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-red-300 hover:bg-white/5"
              >
                {t("nav.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

