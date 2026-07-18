# JustRiff

A social network for words, not pictures. Members write riffs (short essays and thoughts), build an autobiography chapter by chapter on their profile, add photos, make friends, and message each other.

Built with Next.js 14, Prisma, Postgres, and NextAuth. Ready to deploy on Vercel.

## Features

Every account gets a profile whose centerpiece is an autobiography — chapters you write, edit, and grow over time, with a "Read as a book" view that stitches them into one continuous story. The homepage is a feed of riffs with likes and responses. There's friend search with requests you accept or decline, one-on-one messaging with unread badges, and a photo section on each profile with real file uploads.

Privacy: each profile has a visibility setting (everyone on JustRiff, or friends only), and each riff can be published to everyone or friends only. If a profile is set to everyone, its book view is shareable publicly.

Notifications: an Alerts page (with an unread badge in the nav) shows likes, responses, friend requests and acceptances, plus new riffs and chapters from your friends.

There's also a password-reset flow via email.

## Run it locally

1. Install [Node.js](https://nodejs.org) (version 18 or newer).
2. Get a free Postgres database. Easiest option: [neon.tech](https://neon.tech) — create a project and copy the connection string.
3. In this folder, create a file named `.env` (copy `.env.example`) and fill in:
   - `DATABASE_URL` — your Postgres connection string
   - `NEXTAUTH_SECRET` — any long random string
   - `NEXTAUTH_URL` — `http://localhost:3000`
4. In Terminal, from this folder:

```bash
npm install
npx prisma db push
npm run dev
```

5. Open http://localhost:3000, create an account, and start riffing.

## Publish to GitHub

```bash
git init
git add .
git commit -m "JustRiff v1"
```

Then create an empty repository on github.com (no README), and:

```bash
git remote add origin https://github.com/YOUR_USERNAME/justriff.git
git branch -M main
git push -u origin main
```

## Deploy to Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub, and click **Add New → Project**. Import your `justriff` repository.
2. Before deploying, add a database: in your Vercel project, open the **Storage** tab and create a **Postgres** database (Neon). This automatically adds `DATABASE_URL` to your project. (Or paste a connection string from neon.tech into Environment Variables yourself.)
3. In **Settings → Environment Variables**, add:
   - `NEXTAUTH_SECRET` — a long random string ([generate one](https://generate-secret.vercel.app/32))
   - `NEXTAUTH_URL` — your site URL, e.g. `https://justriff.vercel.app` (you can add this after the first deploy once you know the URL)
4. Optional but recommended — enable photo uploads: in the **Storage** tab, also create a **Blob** store. This adds `BLOB_READ_WRITE_TOKEN` automatically. Without it, members can still add photos by pasting an image URL.
5. Optional — enable password-reset emails: get a free API key at [resend.com](https://resend.com) and add it as `RESEND_API_KEY`. You can also set `EMAIL_FROM` (defaults to Resend's onboarding sender, which is fine for testing).
6. Deploy. The build runs `prisma db push` automatically, so your database tables are created on first deploy.

That's it — share the URL and invite your first writers.

## Project structure

- `app/` — pages and UI (App Router)
- `app/page.js` — homepage feed
- `app/profile/[username]/` — profile with autobiography, photos, friends
- `app/messages/` — messaging
- `app/friends/` — friend search and requests
- `lib/actions.js` — all server actions (posting, liking, friending, messaging)
- `prisma/schema.prisma` — database schema

## Notes

- Photo uploads use [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) when `BLOB_READ_WRITE_TOKEN` is set; pasting an image URL always works as a fallback.
- Password-reset emails send through [Resend](https://resend.com) when `RESEND_API_KEY` is set.
- Passwords are hashed with bcrypt; sessions use JWT via NextAuth.
- If you're upgrading an existing database, run `npx prisma db push` once to add the new tables and columns (Vercel does this automatically on deploy).
