# Newsletter MVP

Single-brand newsletter system for the flow: write article -> publish web URL -> send email to subscribers.

## Stack

- Next.js App Router + TypeScript
- Clerk auth for `/admin`
- Convex data/functions for articles, subscribers, and send state
- Tiptap editor with URL-based image insertion
- Resend email sending from `convex/sendArticle.ts`

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Run Convex in a second terminal when connecting to a real deployment:

```bash
pnpm convex:dev
```

## Required environment

See `.env.example` for Clerk, Convex, Resend, and app URL variables. If `RESEND_API_KEY` is omitted or `RESEND_MOCK=1`, the Convex send helper records mock provider IDs for local/dev verification.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Manual smoke path: sign in -> create article -> save draft -> preview -> publish -> open public URL -> add subscriber -> send -> inspect send status.

## MVP boundaries

Included: single admin, draft/publish/send, basic subscribers, URL image insertion, EmailSend status records. Excluded: multi-tenant workspaces, billing, CRM tags/segments/automation, advanced analytics, team approval, and first-party image upload/storage.
