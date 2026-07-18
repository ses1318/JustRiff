import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "./SignOutButton";
import Avatar from "./Avatar";
import { prisma } from "@/lib/prisma";

export default async function Nav() {
  const session = await getServerSession(authOptions);
  let user = null;
  let unread = 0;
  if (session?.user?.id) {
    [user, unread] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id } }),
      prisma.notification.count({ where: { userId: session.user.id, read: false } }),
    ]);
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo-icon.png" alt="" width={28} height={28} />
          JustRiff
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link href="/">Home</Link>
              <Link href="/friends">Friends</Link>
              <Link href="/messages">Messages</Link>
              <Link href="/notifications" style={{ position: "relative" }}>
                Alerts
                {unread > 0 && (
                  <span
                    className="badge"
                    style={{ marginLeft: 4, background: "var(--accent)", color: "#fff" }}
                  >
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
              <Link href={`/profile/${user.username}`}>
                <Avatar name={user.name} color={user.avatarColor} size={30} />
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup" className="btn btn-primary btn-small">Join JustRiff</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
