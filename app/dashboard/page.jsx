"use client";

import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/TopNav";
import NoteCard from "@/components/NoteCard";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useLanguage } from "@/components/LanguageProvider";

export default function DashboardPage() {
  const { user, loading } = useCurrentUser();
  const { t, translateError } = useLanguage();
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    if (!loading) {
      fetchNotes();
    }
  }, [loading]);

  async function fetchNotes() {
    setNotesLoading(true);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (res.ok) {
        setNotes(data.notes || []);
      }
    } catch (error) {
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }

  const filteredNotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = normalized
      ? notes.filter(
          (note) =>
            note.title.toLowerCase().includes(normalized) ||
            note.content.toLowerCase().includes(normalized)
        )
      : [...notes];

    if (sort === "title") {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sort === "oldest") {
      return list.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    }

    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [notes, query, sort]);

  const lastUpdated = useMemo(() => {
    if (notes.length === 0) return "-";
    const sorted = [...notes].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    return new Date(sorted[0].updatedAt).toLocaleString();
  }, [notes]);

  function exportNotes() {
    const dataStr = JSON.stringify(filteredNotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "notes-export.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");

    const payload = { title: form.title, content: form.content };
    const endpoint = editingId ? `/api/notes/${editingId}` : "/api/notes";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus(translateError(data.error) || t("dashboard.noteSaveError"));
      return;
    }

    if (editingId) {
      setNotes((prev) => prev.map((note) => (note.id === editingId ? data.note : note)));
      setStatus(t("dashboard.noteUpdated"));
    } else {
      setNotes((prev) => [data.note, ...prev]);
      setStatus(t("dashboard.noteCreated"));
    }

    setForm({ title: "", content: "" });
    setEditingId(null);
  }

  function handleEdit(note) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content });
    setStatus("");
  }

  async function handleDelete(note) {
    const confirmed = window.confirm(t("dashboard.deleteConfirm"));
    if (!confirmed) return;

    const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((item) => item.id !== note.id));
      setStatus(t("dashboard.noteDeleted"));
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <TopNav username={user?.username} />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="glass rounded-3xl p-6 shadow-soft fade-up">
            <h2 className="font-display text-2xl text-white">{t("dashboard.newNoteTitle")}</h2>
            <p className="mt-2 text-sm text-muted">{t("dashboard.newNoteSubtitle")}</p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="text-sm text-muted">
                {t("dashboard.noteTitleLabel")}
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                  placeholder={t("dashboard.noteTitlePlaceholder")}
                  required
                />
              </label>
              <label className="text-sm text-muted">
                {t("dashboard.noteContentLabel")}
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  className="mt-2 min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
                  placeholder={t("dashboard.noteContentPlaceholder")}
                  required
                />
              </label>

              {status && <p className="text-sm text-muted">{status}</p>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:translate-y-[-1px]"
                >
                  {editingId ? t("dashboard.updateNote") : t("dashboard.saveNote")}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ title: "", content: "" });
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white"
                  >
                    {t("dashboard.cancelEdit")}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="glass rounded-3xl p-6 shadow-soft fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl text-white">{t("dashboard.yourNotes")}</h2>
                <p className="text-xs text-muted">{t("dashboard.items", { count: filteredNotes.length })}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportNotes}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  {t("dashboard.export")}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("dashboard.searchPlaceholder")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none transition focus:border-white/30"
              />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
              >
                <option value="newest">{t("dashboard.sortNewest")}</option>
                <option value="oldest">{t("dashboard.sortOldest")}</option>
                <option value="title">{t("dashboard.sortTitle")}</option>
              </select>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase text-muted">{t("dashboard.statsTitle")}</p>
              <p className="mt-1 text-sm text-white">
                {t("dashboard.statsUpdated")}: {lastUpdated}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {notesLoading && <p className="text-sm text-muted">{t("dashboard.loadingNotes")}</p>}
              {!notesLoading && filteredNotes.length === 0 && (
                <p className="text-sm text-muted">{t("dashboard.noNotes")}</p>
              )}
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
