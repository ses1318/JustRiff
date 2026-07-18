"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button className="btn-small" onClick={() => signOut({ callbackUrl: "/login" })}>
      Log out
    </button>
  );
}
