"use client";

import { useState, useTransition } from "react";
import { updateTagline } from "@/lib/actions";

export default function TaglineEditor({ tagline }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData) {
    startTransition(async () => {
      await updateTagline(formData);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <p className="tagline">
        &ldquo;{tagline}&rdquo;{" "}
        <button className="btn-small" style={{ marginLeft: 6, fontStyle: "normal" }} onClick={() => setOpen(true)}>
          Edit
        </button>
      </p>
    );
  }

  return (
    <form action={handleSubmit} style={{ display: "flex", gap: 8, marginTop: 6 }}>
      <input name="tagline" defaultValue={tagline} maxLength={140} style={{ fontFamily: "var(--serif)", fontStyle: "italic" }} />
      <button type="submit" className="btn-primary btn-small" disabled={pending}>Save</button>
    </form>
  );
}
