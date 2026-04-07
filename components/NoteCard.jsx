"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function NoteCard({ note, onEdit, onDelete }) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-lg text-white">{note.title}</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-white/80">{note.content}</p>
          <p className="mt-3 text-xs text-muted">
            {t("notes.updated", { date: new Date(note.updatedAt).toLocaleString() })}
          </p>
        </div>
        <div className="flex gap-2 sm:flex-col">
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs hover:bg-white/10"
          >
            {t("notes.edit")}
          </button>
          <button
            type="button"
            onClick={() => onDelete(note)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-red-300 hover:bg-white/10"
          >
            {t("notes.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
