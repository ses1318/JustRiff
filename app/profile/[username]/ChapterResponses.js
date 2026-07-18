"use client";

import { useState, useRef, useTransition } from "react";
import { addChapterComment, deleteChapterComment } from "@/lib/actions";
import Avatar from "../../components/Avatar";

export default function ChapterResponses({ chapter, currentUserId, isOwnProfile }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef(null);
  const [pending, startTransition] = useTransition();
  const comments = chapter.comments || [];

  function handleSubmit(formData) {
    startTransition(async () => {
      await addChapterComment(chapter.id, formData);
      formRef.current?.reset();
    });
  }

  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 12 }}>
      <button className="btn-small" onClick={() => setOpen(!open)}>
        {comments.length} {comments.length === 1 ? "response" : "responses"} {open ? "▾" : "▸"}
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <Avatar name={c.user.name} color={c.user.avatarColor} size={26} />
              <div style={{ flex: 1, background: "var(--bg)", borderRadius: 10, padding: "8px 12px" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{c.user.name}</p>
                <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>{c.content}</p>
              </div>
              {(c.userId === currentUserId || isOwnProfile) && (
                <button
                  aria-label="Delete response"
                  className="btn-small"
                  style={{ alignSelf: "flex-start", padding: "0 7px" }}
                  disabled={pending}
                  onClick={() => {
                    if (confirm("Delete this response?"))
                      startTransition(() => deleteChapterComment(c.id));
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <form ref={formRef} action={handleSubmit} style={{ display: "flex", gap: 8 }}>
            <input name="content" required maxLength={2000} placeholder="Respond to this chapter…" autoComplete="off" />
            <button type="submit" className="btn-primary btn-small" disabled={pending}>
              {pending ? "…" : "Post"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
