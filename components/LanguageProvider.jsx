"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const translations = {
  it: {
    "lang.switchEn": "EN",
    "lang.switchIt": "IT",
    "lang.ariaEn": "Passa a inglese",
    "lang.ariaIt": "Passa a italiano",
    "nav.brand": "Capolavoro Unica",
    "nav.greeting": "Ciao",
    "nav.student": "Studente",
    "nav.settings": "Impostazioni",
    "nav.features": "Funzionalita",
    "nav.logout": "Esci",
    "home.badge": "Capolavoro Unica",
    "home.title": "Studia meglio, monitora i progressi e organizza le tue idee in un unico posto sicuro.",
    "home.subtitle":
      "Una piattaforma educativa minimale e professionale con autenticazione sicura, dashboard personale e note integrate su MongoDB.",
    "home.getStarted": "Inizia ora",
    "home.already": "Hai gia' un account",
    "home.featuresLink": "Funzionalita",
    "home.card1.title": "Sicura per progetto",
    "home.card1.body": "JWT, bcrypt, cookie httpOnly e middleware di protezione.",
    "home.card2.title": "2FA pronta",
    "home.card2.body": "Abilita un sistema OTP a 6 cifre per ogni login.",
    "home.card3.title": "Dashboard personale",
    "home.card3.body": "Crea, modifica e organizza le note direttamente dal profilo.",
    "login.title": "Bentornato",
    "login.subtitle": "Accedi per vedere la tua dashboard.",
    "login.button": "Accedi",
    "login.buttonLoading": "Accesso...",
    "login.noAccount": "Non hai un account?",
    "login.create": "Creane uno",
    "register.title": "Crea account",
    "register.subtitle": "Inizia a costruire la tua dashboard didattica.",
    "register.button": "Registrati",
    "register.buttonLoading": "Creazione...",
    "register.already": "Hai gia' un account?",
    "register.login": "Accedi",
    "verify.title": "Verifica a due fattori",
    "verify.subtitle": "Inserisci il codice a 6 cifre mostrato qui sotto.",
    "verify.codeLabel": "Codice di verifica",
    "verify.button": "Verifica",
    "verify.buttonLoading": "Verifica...",
    "verify.codeTitle": "Codice 2FA",
    "verify.codeHint": "Codice attuale: {code}",
    "verifyEmail.title": "Verifica email",
    "verifyEmail.subtitle": "Abbiamo inviato un codice via email. Inseriscilo per attivare l'account.",
    "verifyEmail.codeLabel": "Codice email",
    "verifyEmail.button": "Conferma email",
    "verifyEmail.buttonLoading": "Conferma...",
    "verifyEmail.resend": "Invia di nuovo il codice",
    "verifyEmail.resent": "Se l'email esiste, il codice e' stato reinviato.",
    "verifyEmail.success": "Email verificata. Accesso in corso.",
    "dashboard.newNoteTitle": "Crea una nuova nota",
    "dashboard.newNoteSubtitle": "Raccogli punti chiave, compiti o riflessioni.",
    "dashboard.noteTitleLabel": "Titolo",
    "dashboard.noteTitlePlaceholder": "Riassunto di algebra",
    "dashboard.noteContentLabel": "Contenuto",
    "dashboard.noteContentPlaceholder": "Scrivi le tue note qui...",
    "dashboard.noteCreated": "Nota creata.",
    "dashboard.noteUpdated": "Nota aggiornata.",
    "dashboard.noteDeleted": "Nota eliminata.",
    "dashboard.noteSaveError": "Impossibile salvare la nota.",
    "dashboard.saveNote": "Salva nota",
    "dashboard.updateNote": "Aggiorna nota",
    "dashboard.cancelEdit": "Annulla modifica",
    "dashboard.yourNotes": "Le tue note",
    "dashboard.items": "{count} elementi",
    "dashboard.loadingNotes": "Caricamento note...",
    "dashboard.noNotes": "Nessuna nota presente. Creane una!",
    "dashboard.deleteConfirm": "Eliminare questa nota?",
    "dashboard.searchPlaceholder": "Cerca nelle note...",
    "dashboard.sortLabel": "Ordina per",
    "dashboard.sortNewest": "Piu' recenti",
    "dashboard.sortOldest": "Meno recenti",
    "dashboard.sortTitle": "Titolo A-Z",
    "dashboard.export": "Esporta JSON",
    "dashboard.statsTitle": "Riepilogo",
    "dashboard.statsUpdated": "Ultimo aggiornamento",
    "notes.updated": "Aggiornato {date}",
    "notes.edit": "Modifica",
    "notes.delete": "Elimina",
    "settings.profileTitle": "Profilo",
    "settings.profileDesc": "Panoramica delle informazioni account.",
    "settings.profileUsernameLabel": "Username",
    "settings.profileEmailLabel": "Email",
    "settings.usernameTitle": "Cambia username",
    "settings.usernameDesc": "Aggiorna il nome mostrato in dashboard.",
    "settings.usernameSaved": "Username aggiornato.",
    "settings.emailTitle": "Cambia email",
    "settings.emailDesc": "Mantieni aggiornati i tuoi contatti.",
    "settings.emailSaved": "Email aggiornata.",
    "settings.passwordTitle": "Cambia password",
    "settings.passwordDesc": "Usa una password forte per maggiore sicurezza.",
    "settings.passwordCurrentPlaceholder": "Password attuale",
    "settings.passwordNewPlaceholder": "Nuova password",
    "settings.passwordSaved": "Password aggiornata.",
    "settings.securityTitle": "Sicurezza (2FA)",
    "settings.securityDesc": "Abilita un controllo OTP a 6 cifre.",
    "settings.twoFactorTitle": "Autenticazione a due fattori",
    "settings.twoFactorStatusEnabled": "Attiva",
    "settings.twoFactorStatusDisabled": "Disattiva",
    "settings.enable": "Attiva",
    "settings.disable": "Disattiva",
    "settings.securityEnabled": "2FA attiva. Usa il codice mostrato qui sotto.",
    "settings.securityDisabled": "2FA disattivata.",
    "settings.twoFactorCodeLabel": "Codice 2FA",
    "settings.securityEmailNotice": "Notifica email inviata se configurata.",
    "settings.saveUsername": "Salva username",
    "settings.saveEmail": "Salva email",
    "settings.updatePassword": "Aggiorna password",
    "settings.languageTitle": "Lingua",
    "settings.languageDesc": "Imposta la lingua del sito.",
    "settings.languageAuto": "Automatico (browser)",
    "settings.languageItalian": "Italiano",
    "settings.languageEnglish": "English",
    "settings.languageHelper": "Si applica a tutto il sito.",
    "features.title": "Funzionalita della piattaforma",
    "features.subtitle": "Una panoramica completa delle funzioni disponibili.",
    "features.sectionCore": "Core",
    "features.sectionSecurity": "Sicurezza",
    "features.sectionProductivity": "Produttivita",
    "features.sectionExtras": "Extra",
    "features.backHome": "Torna alla home",
    "security.title": "Ripristino sicurezza",
    "security.subtitle": "Imposta una nuova password e disattiva la 2FA se non l'hai richiesta tu.",
    "security.passwordLabel": "Nuova password",
    "security.resetButton": "Ripristina account",
    "security.resetLoading": "Ripristino...",
    "security.resetSuccess": "Account ripristinato. Ora puoi accedere.",
    "security.resetMissing": "Link non valido o incompleto.",
    "security.resetInvalid": "Token di sicurezza non valido.",
    "securityRevert.title": "Ripristino email",
    "securityRevert.subtitle": "Se non sei stato tu, puoi ripristinare la vecchia email.",
    "securityRevert.confirm": "Conferma il ripristino dell'email precedente per mettere al sicuro l'account.",
    "securityRevert.button": "Ripristina email",
    "securityRevert.loading": "Ripristino...",
    "securityRevert.success": "Email ripristinata. Accesso disconnesso.",
    "securityRevert.missing": "Link non valido o incompleto.",
    "common.email": "Email",
    "common.password": "Password",
    "common.username": "Username",
    "common.genericError": "Qualcosa e' andato storto. Riprova."
  },
  en: {
    "lang.switchEn": "EN",
    "lang.switchIt": "IT",
    "lang.ariaEn": "Switch to English",
    "lang.ariaIt": "Switch to Italian",
    "nav.brand": "Capolavoro Unica",
    "nav.greeting": "Hi",
    "nav.student": "Student",
    "nav.settings": "Settings",
    "nav.features": "Features",
    "nav.logout": "Logout",
    "home.badge": "Capolavoro Unica",
    "home.title": "Learn smarter, track progress, and keep your ideas in one secure place.",
    "home.subtitle":
      "A minimal, professional educational platform with secure authentication, personal dashboard, and a built-in notes system powered by MongoDB.",
    "home.getStarted": "Get Started",
    "home.already": "Already have an account",
    "home.featuresLink": "Features",
    "home.card1.title": "Secure by design",
    "home.card1.body": "JWT auth, bcrypt hashing, httpOnly cookies, and middleware protection.",
    "home.card2.title": "2FA ready",
    "home.card2.body": "Enable a 6-digit OTP system for extra security on every login.",
    "home.card3.title": "Personal dashboard",
    "home.card3.body": "Create, edit, and organize learning notes right inside your profile.",
    "login.title": "Welcome back",
    "login.subtitle": "Log in to access your dashboard.",
    "login.button": "Login",
    "login.buttonLoading": "Signing in...",
    "login.noAccount": "No account yet?",
    "login.create": "Create one",
    "register.title": "Create account",
    "register.subtitle": "Start building your learning dashboard.",
    "register.button": "Register",
    "register.buttonLoading": "Creating...",
    "register.already": "Already registered?",
    "register.login": "Login",
    "verify.title": "Two-factor verification",
    "verify.subtitle": "Enter the 6-digit code shown below.",
    "verify.codeLabel": "Verification code",
    "verify.button": "Verify",
    "verify.buttonLoading": "Verifying...",
    "verify.codeTitle": "2FA code",
    "verify.codeHint": "Current code: {code}",
    "verifyEmail.title": "Verify email",
    "verifyEmail.subtitle": "We sent a code by email. Enter it to activate your account.",
    "verifyEmail.codeLabel": "Email code",
    "verifyEmail.button": "Confirm email",
    "verifyEmail.buttonLoading": "Confirming...",
    "verifyEmail.resend": "Resend code",
    "verifyEmail.resent": "If the email exists, the code has been resent.",
    "verifyEmail.success": "Email verified. Signing you in.",
    "dashboard.newNoteTitle": "Create a new note",
    "dashboard.newNoteSubtitle": "Capture lesson highlights, homework, or reflections.",
    "dashboard.noteTitleLabel": "Title",
    "dashboard.noteTitlePlaceholder": "Algebra summary",
    "dashboard.noteContentLabel": "Content",
    "dashboard.noteContentPlaceholder": "Write your notes here...",
    "dashboard.noteCreated": "Note created.",
    "dashboard.noteUpdated": "Note updated.",
    "dashboard.noteDeleted": "Note deleted.",
    "dashboard.noteSaveError": "Unable to save note.",
    "dashboard.saveNote": "Save note",
    "dashboard.updateNote": "Update note",
    "dashboard.cancelEdit": "Cancel edit",
    "dashboard.yourNotes": "Your notes",
    "dashboard.items": "{count} items",
    "dashboard.loadingNotes": "Loading notes...",
    "dashboard.noNotes": "No notes yet. Create the first one!",
    "dashboard.deleteConfirm": "Delete this note?",
    "dashboard.searchPlaceholder": "Search notes...",
    "dashboard.sortLabel": "Sort by",
    "dashboard.sortNewest": "Newest",
    "dashboard.sortOldest": "Oldest",
    "dashboard.sortTitle": "Title A-Z",
    "dashboard.export": "Export JSON",
    "dashboard.statsTitle": "Overview",
    "dashboard.statsUpdated": "Last update",
    "notes.updated": "Updated {date}",
    "notes.edit": "Edit",
    "notes.delete": "Delete",
    "settings.profileTitle": "Profile",
    "settings.profileDesc": "Overview of your account information.",
    "settings.profileUsernameLabel": "Username",
    "settings.profileEmailLabel": "Email",
    "settings.usernameTitle": "Change username",
    "settings.usernameDesc": "Update the name shown in your dashboard.",
    "settings.usernameSaved": "Username updated.",
    "settings.emailTitle": "Change email",
    "settings.emailDesc": "Keep your contact info up to date.",
    "settings.emailSaved": "Email updated.",
    "settings.passwordTitle": "Change password",
    "settings.passwordDesc": "Use a strong password to keep your account secure.",
    "settings.passwordCurrentPlaceholder": "Current password",
    "settings.passwordNewPlaceholder": "New password",
    "settings.passwordSaved": "Password updated.",
    "settings.securityTitle": "Security (2FA)",
    "settings.securityDesc": "Enable a 6-digit OTP check for extra protection.",
    "settings.twoFactorTitle": "Two-factor authentication",
    "settings.twoFactorStatusEnabled": "Enabled",
    "settings.twoFactorStatusDisabled": "Disabled",
    "settings.enable": "Enable",
    "settings.disable": "Disable",
    "settings.securityEnabled": "2FA enabled. Use the code shown below.",
    "settings.securityDisabled": "2FA disabled.",
    "settings.twoFactorCodeLabel": "2FA code",
    "settings.securityEmailNotice": "Security email sent if configured.",
    "settings.saveUsername": "Save username",
    "settings.saveEmail": "Save email",
    "settings.updatePassword": "Update password",
    "settings.languageTitle": "Language",
    "settings.languageDesc": "Set the website language.",
    "settings.languageAuto": "Automatic (browser)",
    "settings.languageItalian": "Italiano",
    "settings.languageEnglish": "English",
    "settings.languageHelper": "Applies to the whole site.",
    "features.title": "Platform features",
    "features.subtitle": "A complete overview of what you can do.",
    "features.sectionCore": "Core",
    "features.sectionSecurity": "Security",
    "features.sectionProductivity": "Productivity",
    "features.sectionExtras": "Extras",
    "features.backHome": "Back to home",
    "security.title": "Security reset",
    "security.subtitle": "Set a new password and disable 2FA if this was not you.",
    "security.passwordLabel": "New password",
    "security.resetButton": "Reset account",
    "security.resetLoading": "Resetting...",
    "security.resetSuccess": "Account reset. You can now sign in.",
    "security.resetMissing": "Invalid or incomplete link.",
    "security.resetInvalid": "Security token is invalid.",
    "securityRevert.title": "Email restore",
    "securityRevert.subtitle": "If this wasn't you, you can restore the previous email.",
    "securityRevert.confirm": "Confirm the email restore to secure your account.",
    "securityRevert.button": "Restore email",
    "securityRevert.loading": "Restoring...",
    "securityRevert.success": "Email restored. Signed out.",
    "securityRevert.missing": "Invalid or incomplete link.",
    "common.email": "Email",
    "common.password": "Password",
    "common.username": "Username",
    "common.genericError": "Something went wrong. Try again."
  }
};

const errorTranslations = {
  "Invalid payload.": { it: "Payload non valido.", en: "Invalid payload." },
  "Username must be 3-30 characters.": {
    it: "Il nome utente deve avere 3-30 caratteri.",
    en: "Username must be 3-30 characters."
  },
  "Invalid email address.": { it: "Email non valida.", en: "Invalid email address." },
  "Password must be at least 8 characters.": {
    it: "La password deve avere almeno 8 caratteri.",
    en: "Password must be at least 8 characters."
  },
  "Email already in use.": { it: "Email gia' in uso.", en: "Email already in use." },
  "Invalid credentials.": { it: "Credenziali non valide.", en: "Invalid credentials." },
  "Two-factor session expired.": {
    it: "Sessione 2FA scaduta.",
    en: "Two-factor session expired."
  },
  "Invalid two-factor session.": {
    it: "Sessione 2FA non valida.",
    en: "Invalid two-factor session."
  },
  "Invalid two-factor code.": { it: "Codice 2FA non valido.", en: "Invalid two-factor code." },
  "Invalid verification code.": {
    it: "Codice di verifica non valido.",
    en: "Invalid verification code."
  },
  "Verification code expired.": {
    it: "Codice di verifica scaduto.",
    en: "Verification code expired."
  },
  "Email service not configured.": {
    it: "Servizio email non configurato.",
    en: "Email service not configured."
  },
  "2FA locked. Try again later.": {
    it: "2FA bloccata. Riprova piu' tardi.",
    en: "2FA locked. Try again later."
  },
  "Unauthorized.": { it: "Non autorizzato.", en: "Unauthorized." },
  "Title and content are required.": {
    it: "Titolo e contenuto sono obbligatori.",
    en: "Title and content are required."
  },
  "Note not found.": { it: "Nota non trovata.", en: "Note not found." },
  "New password must be at least 8 characters.": {
    it: "La nuova password deve avere almeno 8 caratteri.",
    en: "New password must be at least 8 characters."
  },
  "Current password is incorrect.": {
    it: "La password attuale non e' corretta.",
    en: "Current password is incorrect."
  },
  "Invalid code.": { it: "Codice non valido.", en: "Invalid code." },
  "Security reset token invalid.": {
    it: "Token di sicurezza non valido.",
    en: "Security reset token invalid."
  },
  "Security reset token expired.": {
    it: "Token di sicurezza scaduto.",
    en: "Security reset token expired."
  },
  "Email rollback token invalid.": {
    it: "Token di ripristino email non valido.",
    en: "Email rollback token invalid."
  },
  "Email rollback token expired.": {
    it: "Token di ripristino email scaduto.",
    en: "Email rollback token expired."
  }
};

const LanguageContext = createContext(null);

function interpolate(template, vars) {
  if (!vars) return template;
  return Object.keys(vars).reduce((acc, key) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(vars[key]));
  }, template);
}

function detectBrowserLanguage() {
  if (typeof window === "undefined") return "it";
  const language = navigator.language || navigator.userLanguage || "it";
  return language.toLowerCase().startsWith("it") ? "it" : "en";
}

export function LanguageProvider({ children }) {
  const [preference, setPreference] = useState("auto");
  const [lang, setLang] = useState("it");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("langPreference");
    if (stored === "en" || stored === "it" || stored === "auto") {
      setPreference(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("langPreference", preference);
  }, [preference]);

  useEffect(() => {
    if (preference === "auto") {
      setLang(detectBrowserLanguage());
    } else {
      setLang(preference);
    }
  }, [preference]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const t = (key, vars) => {
      const dict = translations[lang] || translations.it;
      const fallback = translations.it[key] || key;
      const template = dict[key] || fallback;
      return interpolate(template, vars);
    };

    const translateError = (message) => {
      if (!message) return "";
      const entry = errorTranslations[message];
      if (!entry) return message;
      return entry[lang] || message;
    };

    const toggleLanguage = () => {
      const next = lang === "it" ? "en" : "it";
      setPreference(next);
    };

    return { lang, preference, setPreference, t, toggleLanguage, translateError };
  }, [lang, preference]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
