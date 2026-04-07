"use client";

import Link from "next/link";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomePage() {
  const { t } = useLanguage();

  const cards = [
    { title: t("home.card1.title"), body: t("home.card1.body") },
    { title: t("home.card2.title"), body: t("home.card2.body") },
    { title: t("home.card3.title"), body: t("home.card3.body") }
  ];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        <header className="flex flex-col gap-6">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-xs uppercase tracking-[0.3em] text-muted fade-up float-slow">
            {t("home.badge")}
          </div>
          <h1 className="max-w-3xl font-display text-4xl leading-tight text-white fade-up sm:text-5xl">
            {t("home.title")}
          </h1>
          <p className="max-w-2xl text-lg text-muted fade-up">{t("home.subtitle")}</p>
          <div className="flex flex-wrap gap-4 fade-up">
            <Link
              href="/register"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px] glow-pulse"
            >
              {t("home.getStarted")}
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("home.already")}
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`glass rounded-3xl p-6 shadow-soft fade-up delay-${index + 1}`}
            >
              <h3 className="font-display text-xl text-white">{card.title}</h3>
              <p className="mt-3 text-sm text-muted">{card.body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
