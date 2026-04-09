"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageToggle({ className = "" }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const isItalian = lang === "it";
  const label = isItalian ? t("lang.switchEn") : t("lang.switchIt");

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={isItalian ? t("lang.ariaEn") : t("lang.ariaIt")}
      className={`rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold tracking-[0.2em] text-white/80 transition hover:bg-white/10 ${className}`}
    >
      {label}
    </button>
    
  );
}
