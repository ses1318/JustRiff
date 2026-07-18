import Link from "next/link";
import Avatar from "./Avatar";
import LikeButton from "./LikeButton";
import { timeAgo, readTime } from "@/lib/format";

export default function RiffCard({ riff, currentUserId, excerpt = true }) {
  const liked = riff.likes.some((l) => l.userId === currentUserId);
  const body =
    excerpt && riff.content.length > 320 ? riff.content.slice(0, 320) + "…" : riff.content;

  return (
    <article className="card">
      <div className="byline">
        <Link href={`/profile/${riff.user.username}`}>
          <Avatar name={riff.user.name} color={riff.user.avatarColor} />
        </Link>
        <div>
          <p className="byline-name">
            <Link href={`/profile/${riff.user.username}`}>{riff.user.name}</Link>
          </p>
          <p className="byline-sub">
            {timeAgo(riff.createdAt)} · {readTime(riff.content)}
            {riff.visibility === "FRIENDS" && <span className="badge" style={{ marginLeft: 6 }}>Friends only</span>}
          </p>
        </div>
      </div>
      <h2 className="riff-title">
        <Link href={`/riffs/${riff.id}`}>{riff.title}</Link>
      </h2>
      <p className="riff-body">{body}</p>
      <div className="riff-meta">
        <LikeButton riffId={riff.id} liked={liked} count={riff.likes.length} />
        <Link href={`/riffs/${riff.id}`}>
          {riff.comments.length} {riff.comments.length === 1 ? "response" : "responses"}
        </Link>
        <Link href={`/riffs/${riff.id}`} style={{ marginLeft: "auto", color: "var(--accent)" }}>
          Keep reading →
        </Link>
      </div>
    </article>
  );
}
