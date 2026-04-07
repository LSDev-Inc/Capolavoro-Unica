"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";
import SectionCard from "@/components/SectionCard";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useLanguage } from "@/components/LanguageProvider";

export default function SettingsPage() {
  const { user, setUser, loading } = useCurrentUser();
  const { t, translateError, preference, setPreference } = useLanguage();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [securityStatus, setSecurityStatus] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  async function updateUsername(event) {
    event.preventDefault();
    setUsernameStatus("");

    const res = await fetch("/api/user/username", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });

    const data = await res.json();
    if (!res.ok) {
      setUsernameStatus(translateError(data.error) || t("common.genericError"));
      return;
    }

    setUser(data.user);
    setUsernameStatus(t("settings.usernameSaved"));
  }

  async function updateEmail(event) {
    event.preventDefault();
    setEmailStatus("");

    const res = await fetch("/api/user/email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) {
      setEmailStatus(translateError(data.error) || t("common.genericError"));
      return;
    }

    setUser(data.user);
    setEmailStatus(t("settings.emailSaved"));
  }

  async function updatePassword(event) {
    event.preventDefault();
    setPasswordStatus("");

    const res = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await res.json();
    if (!res.ok) {
      setPasswordStatus(translateError(data.error) || t("common.genericError"));
      return;
    }

    setOldPassword("");
    setNewPassword("");
    setPasswordStatus(t("settings.passwordSaved"));
  }

  async function toggle2FA() {
    if (!user) return;
    setSecurityStatus("");
    setTwoFaCode("");

    const res = await fetch("/api/user/2fa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !user.is2FAEnabled })
    });

    const data = await res.json();
    if (!res.ok) {
      setSecurityStatus(translateError(data.error) || t("common.genericError"));
      return;
    }

    setUser(data.user);
    if (data.twoFactorCode) {
      setTwoFaCode(data.twoFactorCode);
    }

    setSecurityStatus(
      data.user.is2FAEnabled ? t("settings.securityEnabled") : t("settings.securityDisabled")
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <TopNav username={user?.username} />

        <div className="grid gap-6">
          <SectionCard
            id="profile"
            title={t("settings.profileTitle")}
            description={t("settings.profileDesc")}
          >
            <div className="grid gap-3 text-sm text-muted sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted">{t("settings.profileUsernameLabel")}</p>
                <p className="text-white">{user?.username || "..."}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted">{t("settings.profileEmailLabel")}</p>
                <p className="text-white">{user?.email || "..."}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="language"
            title={t("settings.languageTitle")}
            description={t("settings.languageDesc")}
          >
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: "auto", label: t("settings.languageAuto") },
                  { id: "it", label: t("settings.languageItalian") },
                  { id: "en", label: t("settings.languageEnglish") }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPreference(option.id)}
                    className={`rounded-2xl border px-4 py-3 text-sm transition ${
                      preference === option.id
                        ? "border-highlight/60 bg-highlight/20 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted">{t("settings.languageHelper")}</p>
            </div>
          </SectionCard>

          <SectionCard
            id="username"
            title={t("settings.usernameTitle")}
            description={t("settings.usernameDesc")}
          >
            <form className="flex flex-col gap-4" onSubmit={updateUsername}>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
              />
              {usernameStatus && <p className="text-sm text-muted">{usernameStatus}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-fit rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-soft"
              >
                {t("settings.saveUsername")}
              </button>
            </form>
          </SectionCard>

          <SectionCard id="email" title={t("settings.emailTitle")} description={t("settings.emailDesc")}>
            <form className="flex flex-col gap-4" onSubmit={updateEmail}>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
              />
              {emailStatus && <p className="text-sm text-muted">{emailStatus}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-fit rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-soft"
              >
                {t("settings.saveEmail")}
              </button>
            </form>
          </SectionCard>

          <SectionCard
            id="password"
            title={t("settings.passwordTitle")}
            description={t("settings.passwordDesc")}
          >
            <form className="flex flex-col gap-4" onSubmit={updatePassword}>
              <input
                type="password"
                placeholder={t("settings.passwordCurrentPlaceholder")}
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
              />
              <input
                type="password"
                placeholder={t("settings.passwordNewPlaceholder")}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
              />
              {passwordStatus && <p className="text-sm text-muted">{passwordStatus}</p>}
              <button
                type="submit"
                className="w-fit rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-soft"
              >
                {t("settings.updatePassword")}
              </button>
            </form>
          </SectionCard>

          <SectionCard
            id="security"
            title={t("settings.securityTitle")}
            description={t("settings.securityDesc")}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-white">{t("settings.twoFactorTitle")}</p>
                  <p className="text-xs text-muted">
                    {user?.is2FAEnabled
                      ? t("settings.twoFactorStatusEnabled")
                      : t("settings.twoFactorStatusDisabled")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggle2FA}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
                >
                  {user?.is2FAEnabled ? t("settings.disable") : t("settings.enable")}
                </button>
              </div>
              {securityStatus && <p className="text-sm text-muted">{securityStatus}</p>}
              {twoFaCode && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase text-muted">{t("settings.twoFactorCodeLabel")}</p>
                  <p className="mt-1 font-display text-xl text-white">{twoFaCode}</p>
                  <p className="mt-2 text-xs text-muted">{t("settings.securityEmailNotice")}</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
