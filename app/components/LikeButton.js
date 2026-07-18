"use client";

import { useTransition } from "react";
import { toggleLike } from "@/lib/actions";

export default function LikeButton({ riffId, liked, count }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="btn-small"
      style={liked ? { color: "#d4537e", borderColor: "#ed93b1" } : {}}
      disabled={pending}
      onClick={() => startTransition(() => toggleLike(riffId))}
    >
      {liked ? "♥" : "♡"} {count}
    </button>
  );
}
