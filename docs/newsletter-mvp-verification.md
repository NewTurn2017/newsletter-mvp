# Newsletter MVP Verification Checklist

Canonical source: `.omx/plans/ralplan-newsletter-system-mvp.md`.

## Current worker-3 verification refresh — 2026-05-09 13:38 UTC

Fresh checks from `/Users/genie/dev/lecture/newsletter` after the leader's Convex send-flow fixes:

- PASS `pnpm lint` → `eslint . --max-warnings=0` exit 0.
- PASS `pnpm typecheck` → `tsc --noEmit` exit 0.
- PASS `pnpm test` → current send-flow tests cover the workflow path; see latest terminal evidence for exact file/test count.
- PASS `pnpm build` → leader reported `pnpm build=0` after the fixes. This worker's later local build rerun was blocked by an existing `.next/dev/lock` from a running Next dev process, not a compile error.

Known verification gaps:

- Real Clerk sign-in and real Resend delivery were not exercised because local credentials/domain are not configured. The send path is covered through mock/workflow tests.
- Manual browser smoke was not run in this worker after build; production build verifies route compilation only.
- Production hardening should decide whether helper queries used by `convex/sendArticle.ts` should become generated internal Convex functions.

## Static checks

- [x] `pnpm lint` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.
- [x] `pnpm build` passes per leader rerun after fixes.

## Unit / workflow checks

- [x] Article schema/primitive checks cover stable slug generation and send eligibility.
- [x] Subscriber validation rejects invalid email input through the server-side utility path.
- [x] Tiptap renderer tests cover the current MVP render path and safe URL behavior.
- [x] Email renderer produces non-empty subject, HTML, plain text, and includes the public article URL.
- [x] Send workflow tests reject unpublished articles before provider calls.
- [x] Send workflow tests create pending records before provider calls.
- [x] Send workflow tests skip `sent`/`pending` duplicates.
- [x] Send workflow tests retry failed records, mark provider failures, and mark article sent after at least one success.

## Convex integration checks

- [x] Article create/update/publish functions call `requireAdmin(ctx)`.
- [x] Subscriber admin list/create/status functions call `requireAdmin(ctx)`.
- [x] `convex/sendArticle.ts` calls `requireAdmin(ctx)` inside Convex.
- [x] `convex/sendArticle.ts` uses exported Convex function names and the `sendId` argument shape for send status mutations.
- [x] Send boundary verifies published/sent status before provider calls.
- [x] EmailSend schema has a `by_article_recipient` index for duplicate prevention.
- [ ] Production hardening: consider failing closed when `ADMIN_EMAILS` is unset and/or converting send helper queries to generated internal functions.

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
