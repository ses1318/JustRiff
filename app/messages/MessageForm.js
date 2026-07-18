"use client";

import { useRef, useTransition } from "react";
import { sendMessage } from "@/lib/actions";

export default function MessageForm({ recipientUsername }) {
  const formRef = useRef(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData) {
    startTransition(async () => {
      await sendMessage(recipientUsername, formData);
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <input name="content" required maxLength={2000} placeholder="Write a message…" autoComplete="off" />
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "…" : "Send"}
      </button>
    </form>
  );
}
