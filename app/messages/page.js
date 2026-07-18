import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Avatar from "../components/Avatar";
import MessageForm from "./MessageForm";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MessagesPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const me = session.user.id;
  const withUsername = searchParams?.with || null;

  const allMessages = await prisma.message.findMany({
    where: { OR: [{ senderId: me }, { recipientId: me }] },
    orderBy: { createdAt: "desc" },
    include: { sender: true, recipient: true },
    take: 500,
  });

  const conversations = new Map();
  for (const m of allMessages) {
    const other = m.senderId === me ? m.recipient : m.sender;
    if (!conversations.has(other.id)) {
      conversations.set(other.id, { user: other, last: m, unread: 0 });
    }
    if (m.recipientId === me && !m.read) conversations.get(other.id).unread++;
  }

  let activeUser = null;
  let thread = [];
  if (withUsername) {
    activeUser = await prisma.user.findUnique({ where: { username: withUsername } });
    if (activeUser && activeUser.id !== me) {
      thread = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: me, recipientId: activeUser.id },
            { senderId: activeUser.id, recipientId: me },
          ],
        },
        orderBy: { createdAt: "asc" },
        take: 200,
      });
      await prisma.message.updateMany({
        where: { senderId: activeUser.id, recipientId: me, read: false },
        data: { read: true },
      });
    }
  }

  return (
    <div className="grid-2" style={{ gridTemplateColumns: "240px minmax(0,1fr)" }}>
      <aside>
        <p className="section-label" style={{ marginTop: 0 }}>Conversations</p>
        {conversations.size === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            No messages yet. Visit a <Link href="/friends" style={{ color: "var(--accent)" }}>friend&apos;s profile</Link> and say hello.
          </p>
        )}
        {[...conversations.values()].map(({ user, last, unread }) => (
          <Link
            key={user.id}
            href={`/messages?with=${user.username}`}
            className="card"
            style={{
              display: "flex", gap: 10, padding: "10px 12px", alignItems: "center",
              borderColor: activeUser?.id === user.id ? "var(--accent)" : "var(--border)",
            }}
          >
            <Avatar name={user.name} color={user.avatarColor} size={32} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {last.content}
              </p>
            </div>
            {unread > 0 && <span className="badge">{unread}</span>}
          </Link>
        ))}
      </aside>

      <div>
        {activeUser ? (
          <>
            <div className="byline" style={{ marginBottom: 14 }}>
              <Avatar name={activeUser.name} color={activeUser.avatarColor} />
              <div>
                <p className="byline-name">
                  <Link href={`/profile/${activeUser.username}`}>{activeUser.name}</Link>
                </p>
                <p className="byline-sub">@{activeUser.username}</p>
              </div>
            </div>
            <div className="card" style={{ minHeight: 300 }}>
              {thread.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", marginTop: 60 }}>
                  No messages yet. Start the conversation below.
                </p>
              )}
              {thread.map((m) => (
                <div key={m.id} className={`msg-row ${m.senderId === me ? "mine" : ""}`}>
                  <div>
                    <div className="msg-bubble">{m.content}</div>
                    <p className="msg-time" style={{ textAlign: m.senderId === me ? "right" : "left" }}>
                      {timeAgo(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <MessageForm recipientUsername={activeUser.username} />
          </>
        ) : (
          <div className="empty" style={{ marginTop: 40 }}>
            Select a conversation, or message a friend from their profile.
          </div>
        )}
      </div>
    </div>
  );
}
