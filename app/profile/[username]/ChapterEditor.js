"use client";

import { useState, useTransition } from "react";
import { saveChapter, deleteChapter } from "@/lib/actions";

export default function ChapterEditor({ chapter, nextNumber }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const isNew = !chapter;

  function handleSubmit(formData) {
    startTransition(async () => {
      await saveChapter(formData);
      setOpen(false);
    });
  }

  if (!open) {
    if (isNew) {
      return (
        <button className="empty" style={{ width: "100%", cursor: "pointer" }} onClick={() => setOpen(true)}>
          + Chapter {nextNumber} — untitled. Keep going, your story isn&apos;t done.
        </button>
      );
    }
    return (
      <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        <button className="btn-small" onClick={() => setOpen(true)}>Edit chapter</button>
        <button
          className="btn-small"
          style={{ color: "#a32d2d" }}
          disabled={pending}
          onClick={() => {
            if (confirm("Delete this chapter? This can't be undone.")) {
              startTransition(() => deleteChapter(chapter.id));
            }
          }}
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} style={{ borderTop: isNew ? "none" : "1px solid var(--border)", paddingTop: isNew ? 0 : 12 }}>
      {!isNew && <input type="hidden" name="chapterId" value={chapter.id} />}
      <input
        name="title"
        defaultValue={chapter?.title || ""}
        placeholder={`Chapter ${chapter?.number || nextNumber} title`}
        required
        maxLength={120}
        style={{ marginBottom: 10, fontFamily: "var(--serif)", fontSize: 16 }}
      />
      <textarea
        name="content"
        defaultValue={chapter?.content || ""}
        placeholder="Tell this part of your story…"
        required
        rows={8}
        maxLength={50000}
        style={{ marginBottom: 10 }}
      />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" className="btn-small" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" className="btn-primary btn-small" disabled={pending}>
          {pending ? "Saving…" : "Save chapter"}
        </button>
      </div>
    </form>
  );
}
