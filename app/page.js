import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RiffCard from "./components/RiffCard";
import Composer from "./components/Composer";
import Avatar from "./components/Avatar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: session.user.id }, { addresseeId: session.user.id }],
    },
    include: { requester: true, addressee: true },
  });

  const friends = friendships.map((f) =>
    f.requesterId === session.user.id ? f.addressee : f.requester
  );
  const friendIds = friends.map((f) => f.id);

  const riffs = await prisma.riff.findMany({
    where: {
      OR: [
        { visibility: "PUBLIC" },
        { userId: { in: [...friendIds, session.user.id] } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: true, likes: true, comments: true },
  });

  return (
    <div className="grid-2">
      <div>
        <Composer />
        {riffs.length === 0 && (
          <div className="empty">No riffs yet. Be the first — write something above.</div>
        )}
        {riffs.map((riff) => (
          <RiffCard key={riff.id} riff={riff} currentUserId={session.user.id} />
        ))}
      </div>
      <aside>
        <p className="section-label" style={{ marginTop: 0 }}>Friends</p>
        {friends.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            No friends yet. <Link href="/friends" style={{ color: "var(--accent)" }}>Find writers →</Link>
          </p>
        )}
        {friends.slice(0, 8).map((f) => (
          <Link
            key={f.id}
            href={`/profile/${f.username}`}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 14 }}
          >
            <Avatar name={f.name} color={f.avatarColor} size={28} /> {f.name}
          </Link>
        ))}
        <p className="section-label">Shortcuts</p>
        <p style={{ fontSize: 14, margin: "0 0 8px" }}>
          <Link href={`/profile/${session.user.username}`} style={{ color: "var(--accent)" }}>
            Write your autobiography →
          </Link>
        </p>
        <p style={{ fontSize: 14, margin: 0 }}>
          <Link href="/messages" style={{ color: "var(--accent)" }}>Check messages →</Link>
        </p>
      </aside>
    </div>
  );
}
