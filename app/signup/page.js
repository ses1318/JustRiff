"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      username: form.get("username"),
      email: form.get("email"),
      password: form.get("password"),
    };
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      setPending(false);
      return;
    }
    await signIn("credentials", {
      email: body.email,
      password: body.password,
      redirect: false,
    });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="form-narrow card">
      <img src="/logo.png" alt="JustRiff" style={{ width: 180, display: "block", margin: "0 auto 20px" }} />
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 24, margin: "0 0 4px" }}>Join JustRiff</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 0 }}>
        A social network for words, not pictures.
      </p>
      <form onSubmit={handleSubmit}>
        <label>Full name</label>
        <input name="name" required placeholder="Scott Simmons" maxLength={60} />
        <label>Username</label>
        <input name="username" required placeholder="scott" maxLength={30} />
        <label>Email</label>
        <input name="email" type="email" required placeholder="you@example.com" />
        <label>Password</label>
        <input name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" style={{ marginTop: 18, width: "100%", justifyContent: "center" }} disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 16 }}>
        Already a member? <Link href="/login" style={{ color: "var(--accent)" }}>Log in</Link>
      </p>
    </div>
  );
}
