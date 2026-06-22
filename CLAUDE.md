# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev           # start dev server
npm run build         # prisma generate + next build
npm run lint          # eslint

npm run db:push       # apply schema changes to DB (uses .env.local)
npm run db:studio     # open Prisma Studio
npm run db:seed       # seed database
npm run db:seed-articles  # seed articles only

npm run cloudinary:ping   # test Cloudinary connectivity
```

All `db:*` and `cloudinary:*` scripts require `.env.local` (loaded by `dotenv-cli`).

## Required environment variables (.env.local)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL URL (Neon) |
| `DATABASE_URL_UNPOOLED` | Direct URL for migrations |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account |
| `CLOUDINARY_API_KEY` | Cloudinary account |
| `CLOUDINARY_API_SECRET` | Cloudinary account |
| `RESEND_API_KEY` | Email sending via Resend |

## Architecture overview

**Public site** (`/`, `/blog/[slug]`, `/webove-aplikace`, `/nahravani`, `/kontakt`) — server-rendered pages with no client auth.

**Admin CMS** (`/admin/*`) — all pages are protected. `proxy.ts` redirects unauthenticated admin requests, and server pages/actions still verify auth through `getCurrentUser()` / `requireUser()` from `lib/auth/user.ts`.

**Authentication flow**: bcrypt password + stateful DB session (`Session`) stored as a hashed token in DB; the HTTP-only cookie contains only the raw random session token (`lib/auth/session.ts`). Login codes (15-min OTP sent via Resend) are also supported. Only users with role `ADMIN` or `EDITOR` can access admin.

**Server Actions**: all mutations use Next.js Server Actions. Action files are colocated at `app/*/actions.ts` or `app/*/[route]-actions.ts`. The shared return type is `ActionState = { error?: string; success?: string; redirectTo?: string }` (defined in `app/admin/actions.ts`). Forms use `useActionState`.

**Prisma**: singleton client in `lib/prisma.ts`. Schema in `prisma/schema.prisma`. After schema changes run `npm run db:push` (dev) or generate a migration. Prisma is also run during `npm run build`.

**Cloudinary**: configured lazily in `lib/cloudinary.ts`. Upload helpers in `lib/cloudinary-upload.ts` and `lib/image-upload.ts`. All public IDs are stored in DB alongside URLs so assets can be deleted.

## Article content model

Articles store their body as a Tiptap JSON document serialized to a `content` text column. The document schema is defined and typed in `lib/article-doc.ts` as `ArticleDoc`. Inline blocks (galleries, audio players) are represented as `galleryBlock` / `audioPlayerBlock` nodes that hold a `blockId` reference to a `ContentBlock` record in the DB. When saving, `syncOrphanContentBlocks` removes any `ContentBlock` rows that are no longer referenced by the document.

## Landing pages

Two landing pages (`webove-aplikace`, `nahravani`) are editable in admin. Their content is stored as JSON in the `LandingPageContent` table. Hardcoded defaults live in `lib/landing-pages.ts` — if a page row doesn't exist or a field is missing, the default is used. The `normalizeContent` function merges DB content onto defaults, so structure changes to defaults flow through automatically.

## Admin navigation

`lib/admin/navigation.ts` is the single source of truth for the admin sidebar. Add a new section or page there and it will appear automatically in the sidebar. Icons are typed — extend the `icon` union when adding new icon types.

## Key conventions

- Server-only modules (`lib/content-blocks.ts`, `lib/landing-pages.ts`, etc.) start with `import "server-only"` — do not import them from client components.
- Zod schemas for form validation live in `lib/validations/`.
- All text (UI, error messages) is in Czech.
- Review scores on articles (`scoreLegacy`, `scorePracticality`, `scorePrice`, `scoreSound`, `scoreLook`) are optional integers — they are all `null` until set.
