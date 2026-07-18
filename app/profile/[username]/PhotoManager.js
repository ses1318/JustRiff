"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPhoto, deletePhoto } from "@/lib/actions";

export default function PhotoManager({ photos, isOwn }) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const formRef = useRef(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    const url = (form.get("url") || "").toString().trim();

    if (file && file.size > 0) {
      setUploading(true);
      const res = await fetch("/api/photos/upload", { method: "POST", body: form });
      setUploading(false);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Upload failed.");
        return;
      }
      formRef.current?.reset();
      setAdding(false);
      router.refresh();
    } else if (url) {
      startTransition(async () => {
        await addPhoto(form);
        formRef.current?.reset();
        setAdding(false);
      });
    } else {
      setError("Choose a file or paste an image URL.");
    }
  }

  const busy = uploading || pending;

  return (
    <div>
      {photos.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No photos yet.</p>
      )}
      <div className="photo-grid" style={{ marginBottom: 10 }}>
        {photos.slice(0, 9).map((p) => (
          <div key={p.id} style={{ position: "relative" }}>
            <img src={p.url} alt={p.caption || "Photo"} title={p.caption} />
            {isOwn && (
              <button
                aria-label="Delete photo"
                style={{
                  position: "absolute", top: 4, right: 4, padding: "0 7px",
                  fontSize: 12, borderRadius: 999, background: "rgba(255,255,255,0.9)",
                }}
                disabled={busy}
                onClick={() => {
                  if (confirm("Remove this photo?")) startTransition(() => deletePhoto(p.id));
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {isOwn && !adding && (
        <button className="btn-small" onClick={() => setAdding(true)}>+ Add photo</button>
      )}
      {isOwn && adding && (
        <form ref={formRef} onSubmit={handleSubmit}>
          <input name="file" type="file" accept="image/*" style={{ marginBottom: 6, fontSize: 12, padding: 6 }} />
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 6px", textAlign: "center" }}>
            — or —
          </p>
          <input name="url" type="url" placeholder="Paste an image URL (https://…)" style={{ marginBottom: 6, fontSize: 12 }} />
          <input name="caption" placeholder="Caption (optional)" maxLength={120} style={{ marginBottom: 6, fontSize: 12 }} />
          {error && <p className="error" style={{ margin: "0 0 6px" }}>{error}</p>}
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className="btn-small" onClick={() => { setAdding(false); setError(""); }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-small" disabled={busy}>
              {busy ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
