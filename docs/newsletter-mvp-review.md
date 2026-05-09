# Newsletter MVP Review Notes

Canonical source: `.omx/plans/ralplan-newsletter-system-mvp.md`.

## Review status

The workspace contains the newsletter MVP scaffold and implementation. Fresh worker-3 checks on 2026-05-09 13:34 UTC are green for lint, typecheck, unit/integration tests, and production build, but the review found Convex runtime-contract risks that static checks do not catch because `convex/_generated/api.ts` currently exposes `internal` as `AnyApi`.

## Current implementation review findings

- `convex/sendArticle.ts:29-40` vs `convex/articles.ts:32-35`, `convex/subscribers.ts:20-23`, `convex/emailSends.ts:13-44` — **High** — the send action calls `internal.articles.getPublishedForSend`, `internal.subscribers.listActiveForSend`, `internal.emailSends.findForArticleRecipient`, and `internal.emailSends.createPending`, but the current Convex files export `getForSend`, `listActive`, `ensurePending`, `markSent`, and `markFailed` instead. Because the generated API is `AnyApi`, `pnpm typecheck` does not catch this; the first real Convex send can fail at runtime unless the function names are aligned.
- `convex/sendArticle.ts:17-22` vs `convex/emailSends.ts:27-44` — **High** — `sendArticle.ts` passes `{ emailSendId }` to `markSent`/`markFailed`, while the mutations expect `{ sendId }`. This is another runtime mismatch hidden by the loose generated API.
- `convex/articles.ts:32-35` — **Medium/High** — `getForSend` returns any article by id and does not verify `status === "published"`; the canonical plan requires send rejection for unpublished articles at the Convex send boundary.
- `convex/lib/auth.ts:7-17` — **Medium** — `requireAdmin` allows any signed-in email when `ADMIN_EMAILS` is unset. That is workable for local setup, but production should fail closed or require explicit admin configuration.
- `tests/integration/send-flow.test.ts:14-31` — **Medium** — current send-flow coverage checks helper/idempotency primitives and email payload rendering, but does not execute `sendArticleWorkflow` or the Convex action wiring. Add a mock-provider workflow test that proves unpublished rejection, pending-before-provider, sent/failed transitions, duplicate skip, unsubscribed exclusion, and article `sent` marking.
- Non-goal search across source files found no implementation of multi-tenant workspace, billing/pricing, CRM segmentation/automation, advanced analytics, approval workflow, or first-party upload/storage.

## Required review gates

### 1. Convex-owned send boundary

Review files:

- `convex/sendArticle.ts`
- `convex/emailSends.ts`
- `convex/lib/auth.ts`
- any Resend wrapper used by the action

Pass criteria:

- `sendArticle.ts` is the only main orchestration boundary for sending.
- The action calls `requireAdmin(ctx)` in Convex.
- Pending records are created/reused before Resend calls.
- Article-recipient idempotency is enforced by an index/query, not by UI state.
- Status transitions are explicit and inspectable: `pending -> sent` or `pending -> failed`.
- Internal Convex function names and argument names match the exported functions.

### 2. Pure TypeScript rendering

Review files:

- `src/lib/render/tiptapToHtml.ts`
- `src/lib/render/tiptapToPlainText.ts`
- any email-rendering wrapper

Pass criteria:

- Renderer does not depend on React components, Next.js request/runtime APIs, or browser DOM APIs.
- Unknown nodes are handled safely.
- Text, URLs, and attributes are escaped before HTML output.
- Image output is URL-only and uses safe `src` and `alt` handling.

### 3. Admin auth boundary

Review files:

- `middleware.ts` / `src/proxy.ts`
- `src/app/admin/**`
- `convex/lib/auth.ts`
- Convex mutation/action files

Pass criteria:

- `/admin` is protected in the app.
- Convex write/publish/send functions enforce admin authorization server-side.
- UI-only checks are treated as UX, not authorization.
- Production admin configuration does not silently fail open.

### 4. MVP scope control

Reject additions that implement non-goals:

- workspace/team/tenant abstractions;
- billing plans;
- tags, segments, automations, or A/B tests;
- advanced analytics;
- team approval/collaboration workflow;
- first-party image upload/storage.

## Documentation requirements before handoff

- README documents setup, env vars, scripts, and the send boundary.
- `.env.example` lists Clerk, Convex, Resend, app URL, and admin variables.
- Verification evidence records exact command outputs for lint, typecheck, tests, and build.
- Any Resend real-send limitation is documented as a local/dev constraint, not hidden.
