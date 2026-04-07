"use client";

import Link from "next/link";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";

export default function FeaturesPage() {
  const { t, lang } = useLanguage();

  const content =
    lang === "it"
      ? {
          core: [
            {
              title: "Dashboard personale",
              body: "Gestisci note, statistiche e contenuti con un layout pulito e veloce."
            },
            {
              title: "Note intelligenti",
              body: "Cerca, ordina ed esporta le note in JSON con un click."
            },
            {
              title: "Profilo aggiornabile",
              body: "Modifica username, email e password senza uscire dalla piattaforma."
            }
          ],
          security: [
            {
              title: "JWT e cookie httpOnly",
              body: "Sessioni sicure con rigenerazione automatica dei token."
            },
            {
              title: "2FA con OTP",
              body: "Codici a 6 cifre con blocco dopo 3 tentativi errati."
            },
            {
              title: "Ripristino sicurezza",
              body: "Email di sicurezza con link per ripristino password e disattivazione 2FA."
            }
          ],
          productivity: [
            {
              title: "Ricerca e filtri",
              body: "Trova rapidamente le note con ricerca full-text e sorting." 
            },
            {
              title: "Esportazione rapida",
              body: "Scarica le tue note in formato JSON per backup o studio." 
            },
            {
              title: "Statistiche immediate",
              body: "Visualizza l'ultimo aggiornamento e il numero totale di note." 
            }
          ],
          extras: [
            {
              title: "Design responsivo",
              body: "Layout ottimizzato per mobile, tablet e desktop." 
            },
            {
              title: "Interfaccia bilingue",
              body: "Passa da italiano a inglese con un click o in automatico." 
            },
            {
              title: "Animazioni eleganti",
              body: "Transizioni leggere per rendere l'esperienza piu' piacevole." 
            }
          ]
        }
      : {
          core: [
            {
              title: "Personal dashboard",
              body: "Manage notes, stats, and content with a clean, fast layout."
            },
            {
              title: "Smart notes",
              body: "Search, sort, and export notes to JSON in one click."
            },
            {
              title: "Editable profile",
              body: "Update username, email, and password without leaving the app."
            }
          ],
          security: [
            {
              title: "JWT and httpOnly cookies",
              body: "Secure sessions with automatic token refresh."
            },
            {
              title: "OTP-based 2FA",
              body: "6-digit codes with lock after 3 invalid attempts."
            },
            {
              title: "Security reset",
              body: "Security email link to reset password and disable 2FA."
            }
          ],
          productivity: [
            {
              title: "Search and filters",
              body: "Quickly find notes with full-text search and sorting." 
            },
            {
              title: "Quick export",
              body: "Download your notes as JSON for backup or study." 
            },
            {
              title: "Instant stats",
              body: "See last update time and total notes at a glance." 
            }
          ],
          extras: [
            {
              title: "Responsive design",
              body: "Layout optimized for mobile, tablet, and desktop." 
            },
            {
              title: "Bilingual UI",
              body: "Switch between Italian and English automatically or manually." 
            },
            {
              title: "Subtle motion",
              body: "Light animations for a more polished experience." 
            }
          ]
        };

  const sections = [
    { title: t("features.sectionCore"), items: content.core },
    { title: t("features.sectionSecurity"), items: content.security },
    { title: t("features.sectionProductivity"), items: content.productivity },
    { title: t("features.sectionExtras"), items: content.extras }
  ];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted transition hover:bg-white/10"
          >
            {t("features.backHome")}
          </Link>
          <LanguageToggle />
        </div>

        <header className="flex flex-col gap-4">
          <h1 className="font-display text-4xl text-white fade-up sm:text-5xl">{t("features.title")}</h1>
          <p className="text-lg text-muted fade-up">{t("features.subtitle")}</p>
        </header>

        <div className="grid gap-8">
          {sections.map((section, index) => (
            <section key={section.title} className="glass rounded-3xl p-6 shadow-soft fade-up">
              <h2 className="font-display text-2xl text-white">{section.title}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {section.items.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="font-display text-lg text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
