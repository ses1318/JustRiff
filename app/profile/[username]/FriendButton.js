"use client";

import { useTransition } from "react";
import Link from "next/link";
import { sendFriendRequest } from "@/lib/actions";

export default function FriendButton({ userId, state }) {
  const [pending, startTransition] = useTransition();

  if (state === "friends") return <span className="badge" style={{ alignSelf: "center" }}>✓ Friends</span>;
  if (state === "sent") return <span className="btn" style={{ opacity: 0.6, cursor: "default" }}>Request sent</span>;
  if (state === "received") return <Link href="/friends" className="btn btn-primary">Respond to request</Link>;

  return (
    <button
      className="btn-primary"
      disabled={pending}
      onClick={() => startTransition(() => sendFriendRequest(userId))}
    >
      {pending ? "Sending…" : "+ Add friend"}
    </button>
  );
}
