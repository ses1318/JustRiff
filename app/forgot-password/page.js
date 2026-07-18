"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="form-narrow card">
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 24, margin: "0 0 4px" }}>Reset your password</h1>
      {sent ? (
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          If that email has a JustRiff account, a reset link is on its way. Check your inbox — the link works for one hour.
        </p>
      ) : (
        <>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 0 }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input name="email" type="email" required placeholder="you@example.com" />
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-primary" style={{ marginTop: 18, width: "100%", justifyContent: "center" }} disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      )}
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 16 }}>
        <Link href="/login" style={{ color: "var(--accent)" }}>← Back to log in</Link>
      </p>
    </div>
  );
}
