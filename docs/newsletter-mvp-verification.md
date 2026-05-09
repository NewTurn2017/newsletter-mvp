# Newsletter MVP Verification Checklist

Canonical source: `.omx/plans/ralplan-newsletter-system-mvp.md`.

## Current worker-3 verification — 2026-05-09 13:34 UTC

Fresh checks from `/Users/genie/dev/lecture/newsletter`:

- PASS `pnpm lint` → `eslint . --max-warnings=0` exit 0.
- PASS `pnpm typecheck` → `tsc --noEmit` exit 0.
- PASS `pnpm test` → 7 files passed, 15 tests passed.
- PASS `pnpm build` → Next.js production build completed; admin, article, subscriber, public article, sign-in, and sign-up routes compiled.

Important review caveat: static checks pass, but `docs/newsletter-mvp-review.md` records Convex runtime-contract risks in `convex/sendArticle.ts` because the generated Convex API is currently loose (`AnyApi`) and does not type-check internal function names/argument names.

Known verification gaps:

- Real Clerk sign-in and real Resend delivery were not exercised because local credentials/domain are not configured. The send path is covered only through mock/helper tests in this worker review.
- Manual browser smoke was not run in this worker after build; production build verifies route compilation only.
- Workspace is not a git repository, so worker-level commit could not be produced without initializing a new repo.

## Static checks

- [x] `pnpm lint` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] `pnpm build` passes.

## Unit checks

- [x] Article schema/primitive checks cover stable slug generation and send eligibility.
- [x] Subscriber validation rejects invalid email input through the server-side utility path.
- [x] Tiptap renderer tests cover the current MVP render path and safe URL behavior.
- [x] Email renderer produces non-empty subject, HTML, plain text, and includes the public article URL.
- [ ] Add deeper workflow-level tests for the actual send orchestration path and Convex internal function wiring.

## Convex integration checks

- [x] Article create/update/publish functions call `requireAdmin(ctx)`.
- [x] Subscriber admin list/create/status functions call `requireAdmin(ctx)`.
- [x] `convex/sendArticle.ts` calls `requireAdmin(ctx)` inside Convex.
- [ ] Align `convex/sendArticle.ts` internal calls with exported Convex function names and argument names.
- [ ] Ensure the send boundary verifies published status before provider calls.
- [x] EmailSend schema has an `by_article_recipient` index for duplicate prevention.
- [ ] Add an executable mock-provider test for pending-before-provider, sent/failed transitions, duplicate sent skip, unsubscribed exclusion, and article marked sent after at least one success.

## App smoke flow

- [ ] Start the app locally.
- [ ] Unauthenticated user cannot access `/admin`.
- [ ] Signed-in admin can create an article with title, heading, paragraph, link, list, blockquote, and URL image.
- [ ] Draft save persists Tiptap JSON.
- [ ] Preview renders close to public article route.
- [ ] Publish creates a stable public URL.
- [ ] Draft articles are not public.
- [ ] Active subscriber can be created and listed.
- [ ] Unsubscribed subscriber is excluded from send targets.
- [ ] Send button/action produces inspectable EmailSend status evidence.

## Non-goal regression guard

Current source review found no implementation of:

- [x] multi-tenant workspace selector;
- [x] billing or pricing screens;
- [x] CRM tags/segments/automations/A-B tests;
- [x] advanced analytics dashboard;
- [x] team approval or collaboration workflow;
- [x] first-party image upload/storage.
