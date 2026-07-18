import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Avatar from "../../components/Avatar";
import ChapterEditor from "./ChapterEditor";
import TaglineEditor from "./TaglineEditor";
import PhotoManager from "./PhotoManager";
import FriendButton from "./FriendButton";
import VisibilityToggle from "./VisibilityToggle";
import ChapterResponses from "./ChapterResponses";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      chapters: {
        orderBy: { number: "asc" },
        include: { comments: { include: { user: true }, orderBy: { createdAt: "asc" } } },
      },
      photos: { orderBy: { createdAt: "desc" } },
      riffs: { orderBy: { createdAt: "desc" }, take: 5, include: { likes: true } },
    },
  });
  if (!user) notFound();

  const isOwn = user.id === session.user.id;

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
    include: { requester: true, addressee: true },
  });
  const friends = friendships.map((f) => (f.requesterId === user.id ? f.addressee : f.requester));

  let friendState = "none";
  const isFriend = friends.some((f) => f.id === session.user.id);
  if (!isOwn) {
    const rel = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, addresseeId: user.id },
          { requesterId: user.id, addresseeId: session.user.id },
        ],
      },
    });
    if (rel?.status === "ACCEPTED") friendState = "friends";
    else if (rel?.requesterId === session.user.id) friendState = "sent";
    else if (rel) friendState = "received";
  }

  const canView = isOwn || isFriend || user.profileVisibility === "PUBLIC";

  if (!canView) {
    return (
      <div style={{ maxWidth: 480, margin: "40px auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
          <Avatar name={user.name} color={user.avatarColor} size={72} />
          <h1 style={{ margin: "14px 0 2px", fontSize: 22 }}>{user.name}</h1>
          <p className="tagline">&ldquo;{user.tagline}&rdquo;</p>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "14px 0 20px" }}>
            This profile is visible to friends only.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <FriendButton userId={user.id} state={friendState} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <Avatar name={user.name} color={user.avatarColor} size={72} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>{user.name}</h1>
          {isOwn ? (
            <TaglineEditor tagline={user.tagline} />
          ) : (
            <p className="tagline">&ldquo;{user.tagline}&rdquo;</p>
          )}
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>
            Autobiography: {user.chapters.length} {user.chapters.length === 1 ? "chapter" : "chapters"} · {friends.length} friends · {user.riffs.length} recent riffs
          </p>
          {isOwn && (
            <div style={{ marginTop: 8 }}>
              <VisibilityToggle current={user.profileVisibility} />
            </div>
          )}
        </div>
        {!isOwn && (
          <div style={{ display: "flex", gap: 8 }}>
            <FriendButton userId={user.id} state={friendState} />
            <Link href={`/messages?with=${user.username}`} className="btn">Message</Link>
          </div>
        )}
      </div>

      <div className="grid-2">
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <p className="section-label">{isOwn ? "My autobiography" : `${user.name.split(" ")[0]}'s autobiography`}</p>
            {user.chapters.length > 0 && (
              <Link href={`/profile/${user.username}/book`} style={{ fontSize: 13, color: "var(--accent)" }}>
                Read as a book →
              </Link>
            )}
          </div>
          {user.chapters.length === 0 && !isOwn && (
            <div className="empty">No chapters yet. Their story is still unwritten.</div>
          )}
          {user.chapters.map((ch) => (
            <article key={ch.id} className="card">
              <p className="chapter-num">Chapter {ch.number}</p>
              <h2 className="riff-title">{ch.title}</h2>
              <p className="riff-body">{ch.content}</p>
              {isOwn && <ChapterEditor chapter={ch} />}
              <ChapterResponses chapter={ch} currentUserId={session.user.id} isOwnProfile={isOwn} />
            </article>
          ))}
          {isOwn && <ChapterEditor nextNumber={user.chapters.length + 1} />}
        </div>

        <aside>
          <p className="section-label" style={{ marginTop: 0 }}>Photos</p>
          <PhotoManager photos={user.photos} isOwn={isOwn} />

          <p className="section-label">Friends · {friends.length}</p>
          {friends.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No friends yet.</p>
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

          <p className="section-label">Recent riffs</p>
          {user.riffs.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No riffs yet.</p>
          )}
          {user.riffs.map((r) => (
            <Link key={r.id} href={`/riffs/${r.id}`} className="card" style={{ display: "block", padding: "10px 14px" }}>
              <p style={{ margin: 0, fontFamily: "var(--serif)", fontWeight: 500, fontSize: 14 }}>{r.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>{r.likes.length} likes</p>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
