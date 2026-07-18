import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Avatar from "../../../components/Avatar";
import { friendIdsOf } from "@/lib/notify";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }) {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: { chapters: { orderBy: { number: "asc" } } },
  });
  if (!user) notFound();

  let canView = user.profileVisibility === "PUBLIC";
  if (!canView && session?.user?.id) {
    if (session.user.id === user.id) canView = true;
    else {
      const friendIds = await friendIdsOf(user.id);
      canView = friendIds.includes(session.user.id);
    }
  }
  if (!canView) notFound();

  const isOwn = session?.user?.id === user.id;
  const totalWords = user.chapters.reduce(
    (sum, ch) => sum + ch.content.trim().split(/\s+/).length,
    0
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "40px 0 30px", borderBottom: "1px solid var(--border)", marginBottom: 30 }}>
        <Avatar name={user.name} color={user.avatarColor} size={64} />
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, margin: "16px 0 4px" }}>
          The story of {user.name}
        </h1>
        <p className="tagline">&ldquo;{user.tagline}&rdquo;</p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10 }}>
          {user.chapters.length} {user.chapters.length === 1 ? "chapter" : "chapters"} · {totalWords.toLocaleString()} words
        </p>
        {session?.user?.id && (
          <Link href={`/profile/${user.username}`} style={{ fontSize: 13, color: "var(--accent)" }}>
            ← Back to profile
          </Link>
        )}
      </div>

      {user.chapters.length === 0 && (
        <div className="empty">
          {isOwn ? "Your book is waiting for its first chapter." : "This story hasn't been written yet."}
        </div>
      )}

      {user.chapters.map((ch) => (
        <section key={ch.id} style={{ marginBottom: 48 }}>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 6px" }}>
            Chapter {ch.number}
          </p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, textAlign: "center", margin: "0 0 20px" }}>
            {ch.title}
          </h2>
          <p style={{ fontFamily: "var(--serif)", fontSize: 17, lineHeight: 1.9, whiteSpace: "pre-wrap", margin: 0 }}>
            {ch.content}
          </p>
        </section>
      ))}

      {user.chapters.length > 0 && (
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--serif)", fontStyle: "italic", padding: "20px 0 40px" }}>
          — to be continued —
        </p>
      )}
    </div>
  );
}
