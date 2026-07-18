"use client";

import { useRef, useTransition } from "react";
import { createRiff } from "@/lib/actions";

export default function Composer() {
  const formRef = useRef(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData) {
    startTransition(async () => {
      await createRiff(formData);
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="card">
      <input
        name="title"
        placeholder="Give your riff a title"
        required
        maxLength={120}
        style={{ marginBottom: 10, fontFamily: "var(--serif)", fontSize: 17 }}
      />
      <textarea
        name="content"
        placeholder="What's on your mind? Riff on it…"
        required
        rows={4}
        maxLength={10000}
        style={{ marginBottom: 10 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <select name="visibility" defaultValue="PUBLIC" style={{ width: "auto", fontSize: 13 }}>
          <option value="PUBLIC">Everyone on JustRiff</option>
          <option value="FRIENDS">Friends only</option>
        </select>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Publishing…" : "Publish riff"}
        </button>
      </div>
    </form>
  );
}
