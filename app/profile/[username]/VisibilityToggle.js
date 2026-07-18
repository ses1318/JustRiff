"use client";

import { useTransition } from "react";
import { updateProfileVisibility } from "@/lib/actions";

export default function VisibilityToggle({ current }) {
  const [pending, startTransition] = useTransition();
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
      {current === "PUBLIC" ? "Profile visible to:" : "Profile visible to:"}
      <select
        defaultValue={current}
        disabled={pending}
        style={{ width: "auto", fontSize: 13, padding: "4px 8px" }}
        onChange={(e) => startTransition(() => updateProfileVisibility(e.target.value))}
      >
        <option value="PUBLIC">Everyone on JustRiff</option>
        <option value="FRIENDS">Friends only</option>
      </select>
    </label>
  );
}
